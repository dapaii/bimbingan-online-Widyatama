import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

interface ApproveBody {
  pengajuanId: string;
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as ApproveBody;
  if (!body.pengajuanId)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { dosen: true },
  });

  if (!profile?.dosen)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const dosen = profile.dosen;
  if (dosen.kuotaTerpakai >= dosen.kuotaMax) {
    return NextResponse.json(
      { error: "Kuota dosen sudah penuh" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.pengajuan.update({
      where: { id: body.pengajuanId },
      data: { status: "DISETUJUI" },
    }),
    prisma.dosen.update({
      where: { id: dosen.id },
      data: { kuotaTerpakai: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ success: true });
}
