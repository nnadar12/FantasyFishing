import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

import dotenv from 'dotenv'

dotenv.config({ path: 'ApiKey.env' }) 
const apiKey = process.env.apiKey;
const genAI = new GoogleGenAI( {apiKey: apiKey});


export async function getFish(imagePath) {

    // Basic validations
    if (!apiKey) {
        console.error('No API key found in environment (process.env.apiKey).');
        throw new Error('API key not configured.');
    }

    if (!fs.existsSync(imagePath)) {
        console.error('Image not found at path:', imagePath);
        throw new Error('Image file not found.');
    }

    const base64ImageFile = fs.readFileSync(imagePath, {
        encoding: "base64",
    });

    const contents = [
        {
            inlineData: {
                mimeType: "image/jpeg",
                data: base64ImageFile,
            },
        },
        { text: "Identify the fish species, weight in pounds, and length in inches. Provide only the JSON object." },
        
    ];
    

    try {
        // THE FIX: Define the schema as a standard JSON Schema object, without the 'Type' enum.
        const responseSchema = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    speciesName: {
                        type: "string",
                    },
                    weight: {
                        type: "number",
                    },
                    length: {
                        type: "number",
                    },
                },
                required: ["speciesName", "weight", "length"],
            },
        };

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        console.log('Generation result:', result.text);
        const jsonText = result.text().substring(7, result.text().length - 3); // Remove "```json" and "```"

        // Save the raw JSON string to a file
        const jsonFilePath = imagePath.replace(/\.[^/.]+$/, "") + ".json";
        fs.writeFileSync(jsonFilePath, jsonText, 'utf8');
        console.log(`Analysis saved to: ${jsonFilePath}`);

        // Parse and return the JSON object
        const parsedJson = JSON.parse(jsonText);
        return parsedJson;

    } catch (err) {
        // This block was being triggered, causing the error on the frontend.
        console.error('API call failed:', err);
        throw new Error('Failed to analyze fish image.');
    }
}