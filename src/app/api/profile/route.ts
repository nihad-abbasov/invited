import { auth } from "@/auth";
import { colorForName, monogram } from "@/lib/identity";
import { setProfile } from "@/lib/server/profileStore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { name?: string; color?: string };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const color = body.color ?? colorForName(name);
  await setProfile(session.user.id, { name, color });
  return NextResponse.json({
    id: session.user.id,
    name,
    color,
    avatar: monogram(name),
  });
}
