import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const createSchema = z.object({ targetUserId: z.string().min(1) });
const responseSchema = z.object({
  friendshipId: z.string().min(1),
  action: z.enum(["accept", "decline"]),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid friend target." }, { status: 400 });
  if (parsed.data.targetUserId === user.id) return NextResponse.json({ error: "You cannot add yourself." }, { status: 400 });

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: user.id, addresseeId: parsed.data.targetUserId },
        { requesterId: parsed.data.targetUserId, addresseeId: user.id },
      ],
    },
  });

  if (existing) {
    return NextResponse.json({ friendship: existing, status: existing.status });
  }

  const friendship = await prisma.friendship.create({
    data: {
      requesterId: user.id,
      addresseeId: parsed.data.targetUserId,
      status: "PENDING",
    },
  });

  return NextResponse.json({ friendship });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = responseSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid friend response." }, { status: 400 });

  const friendship = await prisma.friendship.findUnique({
    where: { id: parsed.data.friendshipId },
  });

  if (!friendship || friendship.addresseeId !== user.id || friendship.status !== "PENDING") {
    return NextResponse.json({ error: "Friend request not found." }, { status: 404 });
  }

  if (parsed.data.action === "decline") {
    await prisma.friendship.delete({ where: { id: friendship.id } });
    return NextResponse.json({ status: "DECLINED" });
  }

  const updated = await prisma.friendship.update({
    where: { id: friendship.id },
    data: { status: "ACCEPTED" },
  });

  return NextResponse.json({ friendship: updated, status: "ACCEPTED" });
}
