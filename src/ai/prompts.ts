import type { PageMetrics } from '../metrics/metrics.types';

export const SYSTEM_PROMPT =

    `You are an expert SEO and UX analyst. You receive structured webpage metrics (extracted by a scraper) plus a sample of the page's body text, and you produce a structured audit report.

CRITICAL RULES:
1. Every insight you provide MUST reference a specific metric by name and value. Never say "the heading structure is weak" — say "Only ${0} H1 tags were found (headings.h1 = 0), indicating no clear page topic."
2. Be specific and data-driven. Generic advice like "improve your SEO" is not acceptable.
3. Your recommendations must be RANKED by impact — priority 1 is the single most important fix.
4. The overallScore should be calculated honestly: 80–100 = strong page, 60–79 = needs work, below 60 = significant issues.
5. Do NOT make up metrics. Only reference numbers that were explicitly provided in the metrics object.
6. You must respond with ONLY valid JSON matching the exact schema provided. No preamble, no markdown, no explanation outside the JSON.

METRIC BENCHMARKS (use these when judging):
- metaTitleLength: ideal 55-60 chars. Under 30 or over 70 = flag it.
- metaDescriptionLength: ideal 150-160 chars. Missing = critical.
- headings.h1: should be exactly 1. 0 = critical. More than 1 = warning.
- headings.h2: 3+ indicates good structure. 0 = flat content, flag it.
- wordCount: under 300 = thin content. Over 1500 = good depth.
- missingAltPercent: 0% = perfect. Over 25% = warning. Over 50% = critical.
- ctaCount: 0 = no clear conversion path (critical for most pages).
- links.external: over 20 external links with low content = warning (link farm signal).`;



export interface BuiltPrompt {
    systemPrompt: string;
    userPrompt: string;
    builtAt: string;
}

export function buildAuditPrompt(metrics: PageMetrics): BuiltPrompt {

    const metricsBlock = JSON.stringify(
        {
            url: metrics.url,
            wordCount: metrics.wordCount,
            headings: metrics.headings,
            paragraphCount: metrics.paragraphCount,
            metaTitle: metrics.metaTitle,
            metaTitleLength: metrics.metaTitleLength,
            metaDescription: metrics.metaDescription,
            metaDescriptionLength: metrics.metaDescriptionLength,
            ctaCount: metrics.ctaCount,
            ctaTexts: metrics.ctaTexts,
            links: metrics.links,
            imageCount: metrics.imageCount,
            imagesWithAlt: metrics.imagesWithAlt,
            imagesMissingAlt: metrics.imagesMissingAlt,
            missingAltPercent: metrics.missingAltPercent,
        },
        null,
        2
    );

    const userPrompt =

        `Audit the following webpage and return a structured JSON report.

## EXTRACTED METRICS (hard facts — reference these in every insight):
\`\`\`json
${metricsBlock}
\`\`\`

## PAGE CONTENT SAMPLE (first 3000 characters of visible body text):
""" ${metrics.bodyTextSample} """
Analyze the page across all 5 concern areas (seoStructure, messagingClarity, ctaUsage, contentDepth, uxConcerns). For each area, your "finding" must explicitly state the relevant metric name and value. Your "metricReference" must be the exact field name from the metrics JSON above (e.g., "headings.h1", "missingAltPercent", "ctaCount").

Provide 3-5 ranked recommendations sorted by impact. Calculate an overallScore (0-100) based on the severity of issues found.`;

    return {
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
        builtAt: new Date().toISOString(),
    };

}