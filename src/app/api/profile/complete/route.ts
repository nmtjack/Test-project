import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores."),
  tag: z.string().trim().min(3).max(6).regex(/^[0-9]+$/, "Tags must be numeric."),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid profile." }, { status: 400 });
  }

  const { username, tag } = parsed.data;
  const existing = await prisma.user.findFirst({
    where: {
      username: { equals: username, mode: "insensitive" },
      tag,
      NOT: { id: user.id },
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: `${username}#${tag} is already taken.` }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { username, tag },
    select: { id: true, username: true, tag: true, accessLevel: true },
  });

  return NextResponse.json({ user: updated });
}
