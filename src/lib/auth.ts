import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AccessLevel } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const hasGoogleOAuth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Username and password",
      credentials: {
        handle: { label: "Username#Tag", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!process.env.DATABASE_URL) return null;

        const handle = credentials?.handle?.trim();
        const password = credentials?.password ?? "";
        if (!handle || !password) return null;

        const [username, tag] = handle.split("#");
        if (!username || !tag) return null;

        const user = await prisma.user.findFirst({
          where: {
            username: { equals: username, mode: "insensitive" },
            tag,
          },
        });

        if (!user?.passwordHash) return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.name ?? `${user.username}#${user.tag}`,
          email: user.email,
          image: user.avatarUrl ?? user.image,
        };
      },
    }),
    ...(hasGoogleOAuth
      ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID ?? "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
          authorization: {
            params: {
              prompt: "select_account",
              access_type: "offline",
              response_type: "code",
            },
          },
        }),
      ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, accessLevel: true, username: true, tag: true, avatarUrl: true, image: true },
        });
        token.userId = user.id;
        token.accessLevel = dbUser?.accessLevel ?? "FREE";
        token.username = dbUser?.username ?? null;
        token.tag = dbUser?.tag ?? null;
        token.avatarUrl = dbUser?.avatarUrl ?? dbUser?.image ?? null;
      }

      if (account?.provider === "google" && account.providerAccountId && token.userId) {
        await prisma.user.update({
          where: { id: String(token.userId) },
          data: {
            googleProviderId: account.providerAccountId,
            lastLoginAt: new Date(),
          },
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId);
        session.user.accessLevel = token.accessLevel as AccessLevel;
        session.user.username = (token.username as string | null) ?? null;
        session.user.tag = (token.tag as string | null) ?? null;
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? session.user.image ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (!user.id) return;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          googleProviderId: account?.provider === "google" ? account.providerAccountId : undefined,
        },
      });
    },
  },
};

export function isPaidAccess(accessLevel?: AccessLevel | string | null) {
  return accessLevel === "PRO" || accessLevel === "LIFETIME" || accessLevel === "ADMIN";
}
