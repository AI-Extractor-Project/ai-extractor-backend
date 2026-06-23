import express from "express";
import { runAudit } from "../ai/insights";
import { getCache, setCache } from "../cache/redis";

export const auditRouter = express.Router();

auditRouter.post("/", async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ error: "URL is required" });
            return;
        }

        const cacheKey = `audit:${url}`;
        const cachedResult = await getCache(cacheKey);

        if (cachedResult) {
            console.log(`[Cache] Returning cached result for ${url}`);
            res.json(cachedResult);
            return;
        }

        const result = await runAudit(url);

        await setCache(cacheKey, result);

        res.json(result);

    } catch (err: any) {
        res.status(500).json({ error: "Audit failed", details: err.message });
    }
});