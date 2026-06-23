import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    GEMINI_KEY: process.env.GEMINI_API_KEY!,
    REDIS_URL: process.env.REDIS_URL!
};