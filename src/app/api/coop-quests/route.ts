import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  activityDate: z.string().datetime(),
  address: z.string().trim().max(240).default(""),
  googleMapsUrl: z.string().trim().max(500).default(""),
  handles: z.array(z.string().trim()).max(20).default([]),
});
const participantActionSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["accept", "decline"]),
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
      creator: { select: { id: true, username: true, tag: true, name: true, image: true, avatarUrl: true } },
    },
    orderBy: { activityDate: "asc" },
  });

  return NextResponse.json({
    quests: quests.map((quest) => ({
      ...quest,
      currentUserParticipantStatus: quest.creatorId === user.id ? null : quest.participants.find((participant) => participant.userId === user.id)?.status ?? null,
    })),
  });
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

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const participantAction = participantActionSchema.safeParse(body);
  if (participantAction.success) {
    const participant = await prisma.coopQuestParticipant.findUnique({
      where: { coopQuestId_userId: { coopQuestId: participantAction.data.id, userId: user.id } },
    });
    if (!participant) return NextResponse.json({ error: "Co-op invite not found." }, { status: 404 });
    if (participantAction.data.action === "decline") {
      await prisma.coopQuestParticipant.update({
        where: { id: participant.id },
        data: { status: "DECLINED" },
      });
      return NextResponse.json({ status: "DECLINED" });
    }
    const updated = await prisma.coopQuestParticipant.update({
      where: { id: participant.id },
      data: { status: "ACCEPTED" },
    });
    return NextResponse.json({ status: updated.status });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: parsed.error?.issues[0]?.message ?? "Invalid co-op quest." }, { status: 400 });

  const existing = await prisma.coopQuest.findUnique({
    where: { id: parsed.data.id },
    select: { id: true, creatorId: true },
  });

  if (!existing || existing.creatorId !== user.id) {
    return NextResponse.json({ error: "Only the creator can edit this co-op quest." }, { status: 403 });
  }

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

  const invitedIds = new Set(invitedUsers.map((member) => member.id));
  const currentParticipants = await prisma.coopQuestParticipant.findMany({
    where: { coopQuestId: existing.id },
    select: { userId: true },
  });
  const currentIds = new Set(currentParticipants.map((participant) => participant.userId));

  const quest = await prisma.$transaction(async (tx) => {
    await tx.coopQuestParticipant.deleteMany({
      where: {
        coopQuestId: existing.id,
        userId: { in: currentParticipants.map((participant) => participant.userId).filter((id) => !invitedIds.has(id)) },
      },
    });
    await Promise.all(
      invitedUsers
        .filter((member) => !currentIds.has(member.id))
        .map((member) => tx.coopQuestParticipant.create({ data: { coopQuestId: existing.id, userId: member.id } })),
    );
    return tx.coopQuest.update({
      where: { id: existing.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        activityDate: new Date(parsed.data.activityDate),
        address: parsed.data.address,
        googleMapsUrl: parsed.data.googleMapsUrl,
      },
      include: {
        participants: { include: { user: { select: { id: true, username: true, tag: true, name: true, image: true, avatarUrl: true } } } },
        creator: { select: { id: true, username: true, tag: true, name: true, image: true, avatarUrl: true } },
      },
    });
  });

  return NextResponse.json({ quest });
}
