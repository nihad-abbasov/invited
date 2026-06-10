import { isRedisConfigured } from "@/lib/redis/client";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ enabled: isRedisConfigured() });
}
