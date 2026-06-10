import { isRedisConfigured } from "@/lib/redis/client";
import { isAuthConfigured } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    enabled: isRedisConfigured(),
    auth: isAuthConfigured(),
  });
}
