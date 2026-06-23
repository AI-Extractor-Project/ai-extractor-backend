import dotenv from "dotenv";

dotenv.config();

export const geminiConfig = {
    keys: [
        process.env.GEMINI_API_KEY_1!,
        process.env.GEMINI_API_KEY_2!,
        process.env.GEMINI_API_KEY_3!
    ]
};