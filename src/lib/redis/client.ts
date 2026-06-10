import { Redis } from "@upstash/redis";

export function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!isRedisConfigured()) {
    throw new Error("Upstash Redis is not configured");
  }
  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return client;
}
