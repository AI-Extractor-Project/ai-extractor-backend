import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    REDIS_URL: process.env.REDIS_URL!,
    DATABASE_URL: process.env.DATABASE_URL!,
    CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || "900", 10),
};