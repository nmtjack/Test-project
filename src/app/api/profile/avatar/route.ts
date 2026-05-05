import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Avatar image is required." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Upload a PNG, JPEG, WEBP, or GIF image." }, { status: 400 });
  }

  if (file.size > 500_000) {
    return NextResponse.json({ error: "Avatar must be smaller than 500 KB for this MVP." }, { status: 400 });
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const avatarUrl = `data:${file.type};base64,${base64}`;
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl, image: avatarUrl },
  });

  return NextResponse.json({ avatarUrl });
}
