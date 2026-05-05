import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  type: z.enum(["DIRECT", "GROUP"]),
  name: z.string().trim().max(48).optional(),
  handles: z.array(z.string().trim().min(3)).min(1).max(12),
});

function parseHandle(handle: string) {
  const [username, tag] = handle.split("#");
  return { username, tag };
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      members: { include: { user: { select: { id: true, username: true, tag: true, name: true, image: true, avatarUrl: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });

  const handles = parsed.data.handles.map(parseHandle).filter((handle) => handle.username && handle.tag);
  const invitedUsers = await prisma.user.findMany({
    where: { OR: handles.map((handle) => ({ username: { equals: handle.username, mode: "insensitive" }, tag: handle.tag })) },
    select: { id: true },
  });

  if (invitedUsers.length !== handles.length) {
    return NextResponse.json({ error: "One or more handles were not found." }, { status: 404 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: parsed.data.type,
      name: parsed.data.type === "GROUP" ? parsed.data.name || "New crew" : null,
      members: {
        create: [{ userId: user.id }, ...invitedUsers.map((member) => ({ userId: member.id }))],
      },
    },
    include: { members: true },
  });

  return NextResponse.json({ conversation });
}
