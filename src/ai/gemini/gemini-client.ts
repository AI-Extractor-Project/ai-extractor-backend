import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { keyManager } from "./key-manager";
import { geminiConfig } from "../../config/gemini.config";

export interface GeminiCallOptions {
    systemPrompt: string;
    userPrompt: string;
    maxRetries?: number;
    maxOutputTokens?: number;
    responseSchema?: any;
}

export interface GeminiResponse {
    rawText: string;
    keyIndexUsed: number;
    attemptCount: number;
    durationMs: number;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
    if (err instanceof Error) {
        return (
            err.message.includes("429") ||
            err.message.toLowerCase().includes("rate limit") ||
            err.message.toLowerCase().includes("quota")
        );
    }
    return false;
}

export async function callGemini(options: GeminiCallOptions): Promise<GeminiResponse> {

    const {
        systemPrompt,
        userPrompt,
        maxRetries = 5,
        maxOutputTokens = 8192,
        responseSchema,
    } = options;

    const startTime = Date.now();
    let lastError: Error | null = null;
    let attemptCount = 0;
    let keyIndexUsed = 0;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        attemptCount++;
        keyIndexUsed = keyManager.getCurrentIndex();

        const genAI = new GoogleGenerativeAI(keyManager.getKey());

        const model: GenerativeModel = genAI.getGenerativeModel({
            model: geminiConfig.model,
            generationConfig: {
                maxOutputTokens,
                temperature: 0.2,
                responseMimeType: "application/json",
                ...(responseSchema && { responseSchema }),
            },
            systemInstruction: systemPrompt,
        });

        try {
            console.log(`Gemini attempt ${attempt + 1}/${maxRetries}, key #${keyIndexUsed + 1}`);

            const result = await model.generateContent(userPrompt);
            const rawText = result.response.text();

            if (!rawText || rawText.trim() === "") {
                throw new Error("Gemini returned empty response");
            }

            console.log(`Gemini succeeded on attempt ${attempt + 1}, took ${Date.now() - startTime}ms`);

            return {
                rawText,
                keyIndexUsed,
                attemptCount,
                durationMs: Date.now() - startTime,
            };

        } catch (err: unknown) {
            lastError = err instanceof Error ? err : new Error(String(err));

            if (isRateLimitError(err)) {
                const backoffMs = Math.pow(2, attempt) * 1000;
                console.warn(`Rate limit hit (attempt ${attempt + 1}), rotating key, waiting ${backoffMs}ms...`);

                keyManager.rotateKey();
                await sleep(backoffMs);

            } else {
                console.warn(`Gemini error on attempt ${attempt + 1}: ${lastError.message}`);
                keyManager.rotateKey();
                if (attempt < maxRetries - 1) {
                    await sleep(1000);
                }
            }
        }
    }

    throw new Error(
        `Gemini API failed after ${maxRetries} attempts. Last error: ${lastError?.message ?? "Unknown error"}`
    );
}