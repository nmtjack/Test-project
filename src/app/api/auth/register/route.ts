import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores."),
  tag: z.string().trim().min(3).max(6).regex(/^[0-9]+$/, "Tags must be numeric."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  displayName: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        error: "Database is not configured. Add DATABASE_URL to .env.local, run pnpm prisma:migrate, then restart the dev server.",
      },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid account details." }, { status: 400 });
  }

  try {
    const { username, tag, password, displayName } = parsed.data;
    const existing = await prisma.user.findFirst({
      where: {
        username: { equals: username, mode: "insensitive" },
        tag,
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ error: `${username}#${tag} is already taken.` }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        tag,
        name: displayName || username,
        passwordHash,
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        tag: true,
        name: true,
        accessLevel: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Account registration failed", error);
    return NextResponse.json(
      {
        error: "Account creation failed. Confirm DATABASE_URL is valid and the Prisma migration has been applied.",
      },
      { status: 500 },
    );
  }
}
