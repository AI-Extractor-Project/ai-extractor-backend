import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export async function getCache(key: string) {
    return await redis.get(key);
}

export async function setCache(key: string, value: any) {
    await redis.set(key, JSON.stringify(value), "EX", 60 * 60 * 24);
}