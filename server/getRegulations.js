import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { get } from "http";

dotenv.config({ path: 'ApiKey.env' });
const apiKey = process.env.apiKey;
const genAI = new GoogleGenAI({ apiKey: apiKey });

export async function getRegulations(species, state) {

    // Basic validations
    if (!apiKey) {
        console.error('No API key found in environment (process.env.apiKey).');
        throw new Error('API key not configured.');
    }

    const prompt = `Get the fishing regulations for a ${species} in ${state}. Give the bag limit and minimum keeping size. Keep response short, 1-2 sentences and do not add any markdown formatting.`;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        
        // THE CHANGE: Return the generated text directly so our server can use it
        return result.text;

    } catch (err) {
        console.error('API call for regulations failed:', err);
        throw new Error('Failed to get regulations from AI model.');
    }
}