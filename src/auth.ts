import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { getRedis, isRedisConfigured } from "@/lib/redis/client";
import { getProfile } from "@/lib/server/profileStore";
import { colorForId, monogram } from "@/lib/identity";

const EMAIL_FROM = process.env.AUTH_EMAIL_FROM ?? "onboarding@resend.dev";

/** Auth is only active when both Redis and the Resend key are present. */
export function isAuthConfigured(): boolean {
  return isRedisConfigured() && !!process.env.AUTH_RESEND_KEY;
}

const adapter = isRedisConfigured()
  ? UpstashRedisAdapter(getRedis(), { baseKeyPrefix: "authjs:" })
  : undefined;

const providers = process.env.AUTH_RESEND_KEY
  ? [Resend({ apiKey: process.env.AUTH_RESEND_KEY, from: EMAIL_FROM })]
  : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers,
  trustHost: true,
  session: { strategy: "database" },
  pages: { verifyRequest: "/auth/check-email" },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user?.id) {
        session.user.id = user.id;
        const profile = await getProfile(user.id);
        const name = profile?.name ?? session.user.name ?? emailLocalPart(session.user.email);
        session.user.name = name;
        session.user.color = profile?.color ?? colorForId(user.id);
        session.user.avatar = monogram(name);
        session.user.hasProfile = !!profile?.name;
      }
      return session;
    },
  },
});

function emailLocalPart(email?: string | null): string {
  if (!email) return "Guest";
  return email.split("@")[0] || "Guest";
}
