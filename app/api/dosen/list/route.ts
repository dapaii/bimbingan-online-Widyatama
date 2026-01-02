import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { dosen: true },
  });

  if (!profile || profile.role !== "DOSEN" || !profile.dosen)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pengajuan = await prisma.pengajuan.findMany({
    where: { dosenId: profile.dosen.id },
    include: {
      mahasiswa: {
        select: {
          id: true,
          nama: true,
          nim: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pengajuan);
}
