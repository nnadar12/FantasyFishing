import { GoogleGenAI, Type } from "@google/genai";
import * as fs from "node:fs";
import * as pathModule from "node:path";

import dotenv from 'dotenv'

dotenv.config({ path: 'ApiKey.env' }) 
const apiKey = process.env.apiKey;
const ai = new GoogleGenAI({ apiKey: apiKey});

async function getFish(imagePath, outputPath) {

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
    // Try to parse JSON from likely response locations.
    const tryParseJSON = (text) => {
        try {
            return JSON.parse(text);
        } catch (e) {
            return null;
        }
    };

    let jsonResult = null;

    if (response.output) {
        // If output is already structured JSON, use it. But also try nested text.
        jsonResult = response.output;

        if (Array.isArray(response.output)) {
            outer: for (const outItem of response.output) {
                if (outItem?.content && Array.isArray(outItem.content)) {
                    for (const c of outItem.content) {
                        if (c?.text) {
                            const parsed = tryParseJSON(c.text);
                            if (parsed) {
                                jsonResult = parsed;
                                break outer;
                            }
                        }
                    }
                }
            }
        }
    }

    if (!jsonResult && response.text) {
        jsonResult = tryParseJSON(response.text);
    }

    if (!jsonResult && response.output?.[0]?.content?.[0]?.text) {
        jsonResult = tryParseJSON(response.output[0].content[0].text);
    }

    if (!jsonResult) {
        const allText = (response.text && String(response.text)) || JSON.stringify(response);
        const match = allText.match(/(\[\s*\{[\s\S]*?\}\s*\])/);
        if (match) {
            jsonResult = tryParseJSON(match[1]);
        }
    }

    if (!jsonResult) {
        jsonResult = [
            {
                speciesName: null,
                weight: null,
                length: null,
                raw: response.text || response,
            },
        ];
    }

    // Ensure the output directory exists and write to the provided outputPath
    try {
        const outDir = pathModule.dirname(outputPath);
        if (outDir && !fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        fs.writeFileSync(outputPath, JSON.stringify(jsonResult, null, 2), "utf8");
        console.log(`Wrote parsed result to ${outputPath}`);
    } catch (err) {
        console.error("Failed to write output file:", err);
    }
}
getFish("./testFiles/SmallmouthBass.jpg", "./testFiles/test.json");