import Redis from "ioredis";
import { env } from "../config/env";

const redis = new Redis(env.REDIS_URL, {
    retryStrategy(times) {
        if (times > 3) {
            console.warn("[Redis] Could not connect to Redis. Caching is temporarily disabled.");
            return null;
        }
        return Math.min(times * 1000, 3000);
    },
    enableOfflineQueue: false
});

redis.on("error", (err: any) => {
    if (err.code !== 'ECONNREFUSED') {
        console.error("[Redis] Cache Error:", err);
    }
});

redis.on("connect", () => {
    console.log("[Redis] Cache Connected");
});

export async function getCache<T>(key: string): Promise<T | null> {
    try {
        console.log(`[Redis] Attempting to get cache for key: ${key}`);
        const data = await redis.get(key);
        if (!data) {
            console.log(`[Redis] Cache miss for key: ${key}`);
            return null;
        }
        console.log(`[Redis] Cache hit for key: ${key}`);
        return JSON.parse(data) as T;
    } catch (error) {
        console.error(`[Redis] Error getting cache for key ${key}:`, error);
        return null;
    }
}

export async function setCache(key: string, value: any, ttlSeconds: number = env.CACHE_TTL_SECONDS) {
    try {
        console.log(`[Redis] Setting cache for key: ${key} with TTL: ${ttlSeconds}`);
        await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);

        console.log(`[Redis] Cache successfully set for key: ${key}`);
    } catch (error) {
        console.error(`[Redis] Error setting cache for key ${key}:`, error);
    }
}

export async function clearCache(key: string) {
    try {
        await redis.del(key);
    } catch (error) {
        console.error(`[Redis] Error clearing cache for key ${key}:`, error);
    }
}

export async function flushCache() {
    try {
        await redis.flushall();
    } catch (error) {
        console.error(`[Redis] Error flushing cache:`, error);
    }
}

export default redis;