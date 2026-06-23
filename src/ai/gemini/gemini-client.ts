import { GoogleGenerativeAI } from "@google/generative-ai";
import { keyManager } from "./key-manager";

function createClient() {
    return new GoogleGenerativeAI(keyManager.getKey());
}

export async function callGemini(prompt: string) {
    const maxRetries = 3;

    for (let i = 0; i < maxRetries; i++) {
        try {
            const genAI = createClient();

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash"
            });

            const result = await model.generateContent(prompt);

            return result.response.text();

        } catch (err: any) {
            console.log("❌ Gemini failed:", err.message);

            keyManager.rotateKey();

            if (i === maxRetries - 1) {
                throw new Error("All Gemini API keys failed");
            }
        }
    }
}