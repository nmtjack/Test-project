import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: user.id }, { addresseeId: user.id }],
    },
    include: {
      requester: { select: { id: true, name: true, username: true, tag: true, image: true, avatarUrl: true, accessLevel: true } },
      addressee: { select: { id: true, name: true, username: true, tag: true, image: true, avatarUrl: true, accessLevel: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const friends = friendships.map((friendship) => (friendship.requesterId === user.id ? friendship.addressee : friendship.requester));

  return NextResponse.json({ friends });
}
