import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const nama: string | undefined = body.nama;
  const skillIds: string[] = Array.isArray(body.skillIds)
    ? body.skillIds
    : [];

  if (!nama || typeof nama !== "string") {
    return NextResponse.json(
      { error: "Nama tidak valid" },
      { status: 400 }
    );
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { dosen: true },
  });

  if (!profile?.dosen) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const dosenId = profile.dosen.id;

  // pakai transaction biar aman
  const result = await prisma.$transaction(async tx => {
    // update nama dosen
    const updatedDosen = await tx.dosen.update({
      where: { id: dosenId },
      data: { nama },
    });

    // hapus relasi lama
    await tx.dosenSkill.deleteMany({
      where: { dosenId },
    });

    // insert relasi baru kalau ada
    if (skillIds.length > 0) {
      await tx.dosenSkill.createMany({
        data: skillIds.map(skillId => ({
          dosenId,
          skillId,
        })),
      });
    }

    return updatedDosen;
  });

  return NextResponse.json({
    success: true,
    dosen: result,
  });
}
