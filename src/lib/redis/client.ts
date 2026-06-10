import { Redis } from "@upstash/redis";

/**
 * Resolve Upstash REST credentials.
 *
 * Vercel's Upstash integration injects different env var names depending on how
 * the database was created:
 *   - Newer Upstash Redis:   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *   - Marketplace "KV" store: KV_REST_API_URL / KV_REST_API_TOKEN
 * We accept either.
 */
function resolveCreds(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";
  if (!url || !token) return null;
  return { url, token };
}

export function isRedisConfigured(): boolean {
  return resolveCreds() !== null;
}

let client: Redis | null = null;

export function getRedis(): Redis {
  const creds = resolveCreds();
  if (!creds) {
    throw new Error("Upstash Redis is not configured");
  }
  if (!client) {
    client = new Redis({ url: creds.url, token: creds.token });
  }
  return client;
}
