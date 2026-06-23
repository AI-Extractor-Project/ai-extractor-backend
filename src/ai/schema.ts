import { z } from "zod";

export const GEMINI_RESPONSE_SCHEMA = {
    type: "object",
    properties: {
        overallScore: { type: "number" },
        seoStructure: {
            type: "object",
            properties: {
                finding: { type: "string" },
                metricReference: { type: "string" },
                severity: { type: "string" }
            },
            required: ["finding", "metricReference", "severity"]
        },
        messagingClarity: {
            type: "object",
            properties: {
                finding: { type: "string" },
                metricReference: { type: "string" },
                severity: { type: "string" }
            },
            required: ["finding", "metricReference", "severity"]
        },
        ctaUsage: {
            type: "object",
            properties: {
                finding: { type: "string" },
                metricReference: { type: "string" },
                severity: { type: "string" }
            },
            required: ["finding", "metricReference", "severity"]
        },
        contentDepth: {
            type: "object",
            properties: {
                finding: { type: "string" },
                metricReference: { type: "string" },
                severity: { type: "string" }
            },
            required: ["finding", "metricReference", "severity"]
        },
        uxConcerns: {
            type: "object",
            properties: {
                finding: { type: "string" },
                metricReference: { type: "string" },
                severity: { type: "string" }
            },
            required: ["finding", "metricReference", "severity"]
        },
        recommendations: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    priority: { type: "number" },
                    action: { type: "string" },
                    impact: { type: "string" }
                },
                required: ["priority", "action", "impact"]
            }
        }
    },
    required: ["overallScore", "seoStructure", "messagingClarity", "ctaUsage", "contentDepth", "uxConcerns", "recommendations"]
};

const ConcernAreaSchema = z.object({
    finding: z.string(),
    metricReference: z.string(),
    severity: z.string(),
});

const RecommendationSchema = z.object({
    priority: z.number(),
    action: z.string(),
    impact: z.string(),
});

export const AuditSchema = z.object({
    overallScore: z.number(),
    seoStructure: ConcernAreaSchema,
    messagingClarity: ConcernAreaSchema,
    ctaUsage: ConcernAreaSchema,
    contentDepth: ConcernAreaSchema,
    uxConcerns: ConcernAreaSchema,
    recommendations: z.array(RecommendationSchema),
});
