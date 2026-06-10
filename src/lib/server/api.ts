import { isRedisConfigured } from "@/lib/redis/client";
import { NextResponse } from "next/server";

export function storageUnavailable() {
  return NextResponse.json({ error: "storage_not_configured" }, { status: 503 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function withRedis<T extends (...args: never[]) => Promise<Response>>(
  handler: T,
): T {
  return (async (...args: Parameters<T>) => {
    if (!isRedisConfigured()) return storageUnavailable();
    try {
      return await handler(...args);
    } catch (err) {
      console.error("[api]", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }) as T;
}
