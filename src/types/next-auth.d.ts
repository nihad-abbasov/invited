import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      color: string;
      avatar: string;
      /** True once the user has chosen a display name. */
      hasProfile: boolean;
    } & DefaultSession["user"];
  }
}
