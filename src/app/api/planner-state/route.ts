import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const plannerStateSchema = z.object({
  quests: z.array(z.record(z.string(), z.unknown())).default([]),
  xp: z.number().finite().default(0),
  coins: z.number().finite().default(0),
  streak: z.number().finite().default(0),
  shields: z.number().finite().default(2),
  bossName: z.string().max(160).default("Weekly Boss"),
  bossHp: z.number().finite().default(100),
  dailyEnergy: z.number().finite().default(10),
  availableHours: z.number().finite().default(5),
  theme: z.enum(["fantasy", "edgy", "anime", "cute", "professional"]).default("fantasy"),
  skillLabels: z.record(z.string(), z.string()).default({}),
  challengeDone: z.boolean().default(false),
});

const plannerPatchSchema = plannerStateSchema.partial();

function asJsonInput(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.plannerState.findUnique({
    where: { userId: user.id },
    select: { data: true, updatedAt: true },
  });

  return NextResponse.json({ state: row?.data ?? null, updatedAt: row?.updatedAt ?? null });
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = plannerStateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid planner state." }, { status: 400 });
  }

  const row = await prisma.plannerState.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      data: asJsonInput(parsed.data),
    },
    update: {
      data: asJsonInput(parsed.data),
    },
    select: { data: true, updatedAt: true },
  });

  return NextResponse.json({ state: row.data, updatedAt: row.updatedAt });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = plannerPatchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid planner state." }, { status: 400 });
  }

  const existing = await prisma.plannerState.findUnique({
    where: { userId: user.id },
    select: { data: true },
  });
  const current = plannerStateSchema.parse(existing?.data ?? {});
  const next = { ...current, ...parsed.data };

  const row = await prisma.plannerState.upsert({
    where: { userId: user.id },
    create: { userId: user.id, data: asJsonInput(next) },
    update: { data: asJsonInput(next) },
    select: { data: true, updatedAt: true },
  });

  return NextResponse.json({ state: row.data, updatedAt: row.updatedAt });
}
