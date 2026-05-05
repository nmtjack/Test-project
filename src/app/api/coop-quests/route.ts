import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  activityDate: z.string().datetime(),
  address: z.string().trim().min(3).max(240),
  googleMapsUrl: z.string().url().refine((value) => value.includes("google.") || value.includes("goo.gl") || value.includes("maps.app.goo.gl"), "Use a Google Maps URL."),
  handles: z.array(z.string().trim()).max(20).default([]),
});

function parseHandle(handle: string) {
  const [username, tag] = handle.split("#");
  return { username, tag };
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quests = await prisma.coopQuest.findMany({
    where: { OR: [{ creatorId: user.id }, { participants: { some: { userId: user.id } } }] },
    include: {
      participants: { include: { user: { select: { id: true, username: true, tag: true, name: true, image: true, avatarUrl: true } } } },
    },
    orderBy: { activityDate: "asc" },
  });

  return NextResponse.json({ quests });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid co-op quest." }, { status: 400 });

  const handles = parsed.data.handles.map(parseHandle).filter((handle) => handle.username && handle.tag);
  const invitedUsers = handles.length
    ? await prisma.user.findMany({
        where: { OR: handles.map((handle) => ({ username: { equals: handle.username, mode: "insensitive" }, tag: handle.tag })) },
        select: { id: true },
      })
    : [];

  if (invitedUsers.length !== handles.length) {
    return NextResponse.json({ error: "One or more invite handles were not found." }, { status: 404 });
  }

  const quest = await prisma.coopQuest.create({
    data: {
      creatorId: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      activityDate: new Date(parsed.data.activityDate),
      address: parsed.data.address,
      googleMapsUrl: parsed.data.googleMapsUrl,
      participants: {
        create: invitedUsers.map((member) => ({ userId: member.id })),
      },
    },
    include: { participants: true },
  });

  return NextResponse.json({ quest });
}
