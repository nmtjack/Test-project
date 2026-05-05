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

  const friendsById = new Map<string, (typeof friendships)[number]["requester"]>();
  friendships.forEach((friendship) => {
    const friend = friendship.requesterId === user.id ? friendship.addressee : friendship.requester;
    friendsById.set(friend.id, friend);
  });

  const incomingRequests = await prisma.friendship.findMany({
    where: { addresseeId: user.id, status: "PENDING" },
    include: {
      requester: { select: { id: true, name: true, username: true, tag: true, image: true, avatarUrl: true, accessLevel: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const outgoingRequests = await prisma.friendship.findMany({
    where: { requesterId: user.id, status: "PENDING" },
    include: {
      addressee: { select: { id: true, name: true, username: true, tag: true, image: true, avatarUrl: true, accessLevel: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    friends: Array.from(friendsById.values()),
    incomingRequests: incomingRequests.map((request) => ({ id: request.id, user: request.requester })),
    outgoingRequests: outgoingRequests.map((request) => ({ id: request.id, user: request.addressee })),
  });
}
