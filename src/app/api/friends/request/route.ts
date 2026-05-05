import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({ targetUserId: z.string().min(1) });

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid friend target." }, { status: 400 });
  if (parsed.data.targetUserId === user.id) return NextResponse.json({ error: "You cannot add yourself." }, { status: 400 });

  const friendship = await prisma.friendship.upsert({
    where: {
      requesterId_addresseeId: {
        requesterId: user.id,
        addresseeId: parsed.data.targetUserId,
      },
    },
    create: {
      requesterId: user.id,
      addresseeId: parsed.data.targetUserId,
      status: "ACCEPTED",
    },
    update: { status: "ACCEPTED" },
  });

  return NextResponse.json({ friendship });
}
