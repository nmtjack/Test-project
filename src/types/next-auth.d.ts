import type { AccessLevel } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accessLevel: AccessLevel;
      username?: string | null;
      tag?: string | null;
      avatarUrl?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    accessLevel?: AccessLevel;
    username?: string | null;
    tag?: string | null;
    avatarUrl?: string | null;
  }
}
