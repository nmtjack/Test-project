import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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

  if (file.size > 2_000_000) {
    return NextResponse.json({ error: "Avatar must be smaller than 2 MB." }, { status: 400 });
  }

  const extension = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "png";
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadDir, { recursive: true });
  const filename = `${user.id}-${Date.now()}.${extension}`;
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  const avatarUrl = `/uploads/avatars/${filename}`;
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl, image: avatarUrl },
  });

  return NextResponse.json({ avatarUrl });
}
