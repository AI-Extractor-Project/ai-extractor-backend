import express from "express";
import { runAudit } from "../ai/insights";

export const auditRouter = express.Router();

auditRouter.post("/", async (req, res) => {
    try {
        const { url } = req.body;

        const result = await runAudit(url);

        res.json(result);

    } catch (err: any) {
        res.status(500).json({ error: "Audit failed", details: err.message });
    }
});