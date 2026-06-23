import { extractMetrics } from "../metrics/metrics";
import { buildAuditPrompt } from "./prompts";
import { callGemini } from "./gemini/gemini-client";
import { scrapeUrl } from "../scraper/scraper";
import { AuditSchema, GEMINI_RESPONSE_SCHEMA } from "./schema";

export async function runAudit(url: string) {
    try {
        let scraped;
        try {
            scraped = await scrapeUrl(url);
        } catch (error) {
            throw new Error("Failed to scan the website. The URL might be invalid, or the website is blocking our request.");
        }

        let metrics;
        try {
            metrics = extractMetrics(scraped.html, scraped.finalUrl);
        } catch (error) {
            throw new Error("Failed to extract data from the website. The page structure might be unsupported.");
        }

        const prompt = buildAuditPrompt(metrics);

        let aiResponse;
        try {
            aiResponse = await callGemini({
                ...prompt,
                responseSchema: GEMINI_RESPONSE_SCHEMA
            });
        } catch (error) {
            throw new Error("The AI service failed to generate an audit report. Please try again later.");
        }

        if (!aiResponse || !aiResponse.rawText) {
            throw new Error("The AI returned an empty response.");
        }

        const rawText = aiResponse.rawText;
        const cleanText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(cleanText);
        } catch (error) {
            throw new Error("Failed to read the AI report. The response format was invalid.");
        }

        let validated;
        try {
            validated = AuditSchema.parse(parsed);
        } catch (error) {
            throw new Error("The AI generated an incomplete or incorrectly formatted report.");
        }

        return {
            url,
            metrics,
            insights: validated,
            promptLogs: {
                systemPrompt: prompt.systemPrompt,
                userPrompt: prompt.userPrompt,
                rawModelOutput: rawText,
            }
        };

    } catch (error: any) {
        if (error.message) {
            throw error;
        }
        throw new Error("An unexpected error occurred during the audit process.");
    }
}