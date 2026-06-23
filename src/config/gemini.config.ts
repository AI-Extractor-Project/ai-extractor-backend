import dotenv from "dotenv";

dotenv.config();

export const geminiConfig = {
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    keys: [
        process.env.GEMINI_API_KEY_1!,
        process.env.GEMINI_API_KEY_2!,
        process.env.GEMINI_API_KEY_3!
    ]
};