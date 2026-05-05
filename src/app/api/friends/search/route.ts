import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ users: [] });

  const [rawName, rawTag] = query.split("#");
  const users = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      username: rawName
        ? { contains: rawName, mode: "insensitive" }
        : undefined,
      tag: rawTag ? { startsWith: rawTag } : undefined,
    },
    select: { id: true, name: true, username: true, tag: true, image: true, avatarUrl: true, accessLevel: true },
    take: 12,
  });

  return NextResponse.json({ users });
}
