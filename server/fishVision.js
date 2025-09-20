import { GoogleGenAI, Type } from "@google/genai";
import * as fs from "node:fs";

import dotenv from 'dotenv'

dotenv.config({ path: 'ApiKey.env' }) 
const apiKey = process.env.apiKey;
console.log("API Key:", apiKey);
const ai = new GoogleGenAI({ apiKey: apiKey});

async function getFish(path) {

    const base64ImageFile = fs.readFileSync(path, {
        encoding: "base64",
    });

    const contents = [
        {
            inlineData: {
                mimeType: "image/jpeg",
                data: base64ImageFile,
            },
        },
        { text: "Identify the fish species, weight in pounds, and length in inches" },
        
    ];

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        speciesName: {
                            type: Type.STRING,
                        },
                        weight: {
                            type: Type.NUMBER,
                        },
                        length: {
                            type: Type.NUMBER,
                        },
                    },
                },
            },
            propertyOrdering: ["speciesName", "weight", "length"],
        },
    });
    // The SDK may return generated data in different fields depending on version.
    // Prefer structured output if available, otherwise fall back to text.
    if (response.output) {
        console.log(JSON.stringify(response.output, null, 2));
    } else if (response.text) {
        console.log(response.text);
    } else {
        console.log(response);
    }
}
getFish("./testFiles/SmallmouthBass.jpg");