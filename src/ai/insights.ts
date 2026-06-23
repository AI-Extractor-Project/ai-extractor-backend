import { extractMetrics } from "../metrics/metrics";
import { buildAuditPrompt } from "./prompts";
import { AuditSchema } from "./schema";
import { callGemini } from "./gemini/gemini-client";
import { scrapeUrl } from "../scraper/scraper";

export async function runAudit(url: string) {
    // 1. scrape
    const scraped = await scrapeUrl(url);


    // // 2. metrics
    const metrics = extractMetrics(scraped.html, scraped.finalUrl);

    // return { scraped };
    return { metrics }

    // 3. prompt
    const prompt = buildAuditPrompt(metrics);

    // // 4. AI call
    // const aiResponse = await callGemini(prompt);

    // if (!aiResponse) {
    //     throw new Error("Failed to get response from AI");
    // }

    // // 5. parse AI JSON
    // const parsed = JSON.parse(aiResponse);

    // // 6. validate
    // const validated = AuditSchema.parse(parsed);

    // return {
    //     url,
    //     metrics,
    //     insights: validated
    // };
}