/**
 * App-owned user profile (display name + color), stored separately from the
 * Auth.js adapter records so we never fight the adapter's own key schema.
 *
 * Key: profile:{userId} -> { name, color }
 */

import { getRedis } from "@/lib/redis/client";

export interface Profile {
  name: string;
  color: string;
}

const KEY = (userId: string) => `profile:${userId}`;

export async function getProfile(userId: string): Promise<Profile | null> {
  return (await getRedis().get<Profile>(KEY(userId))) ?? null;
}

export async function setProfile(userId: string, profile: Profile): Promise<Profile> {
  await getRedis().set(KEY(userId), profile);
  return profile;
}
