import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

const COOLDOWN_MINUTES = 15;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const dosenId = formData.get("dosenId") as string;

  if (!dosenId) {
    return NextResponse.json({ error: "Dosen tidak valid" }, { status: 400 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { mahasiswa: true },
  });

  if (!profile || profile.role !== "MAHASISWA" || !profile.mahasiswa) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const mahasiswaId = profile.mahasiswa.id;

  // CEK PENGAJUAN TERAKHIR
  const lastSubmission = await prisma.pengajuan.findFirst({
    where: { mahasiswaId },
    orderBy: { createdAt: "desc" },
  });

  if (lastSubmission) {
    // masih aktif
    if (
      lastSubmission.status === "MENUNGGU" ||
      lastSubmission.status === "DISETUJUI"
    ) {
      return NextResponse.json(
        { error: "Kamu masih memiliki pengajuan aktif" },
        { status: 400 }
      );
    }

    // DITOLAK → cek cooldown
    if (lastSubmission.status === "DITOLAK") {
      const now = new Date();
      const rejectedAt = lastSubmission.updatedAt;

      const diffMs = now.getTime() - rejectedAt.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      if (diffMinutes < COOLDOWN_MINUTES) {
        return NextResponse.json(
          {
            error: `Pengajuan ditolak. Silakan coba lagi dalam ${
              COOLDOWN_MINUTES - diffMinutes
            } menit.`,
          },
          { status: 400 }
        );
      }

      //  cooldown selesai → hapus record lama
      await prisma.pengajuan.delete({
        where: { id: lastSubmission.id },
      });
    }
  }

  // VALIDASI DOSEN
  const dosen = await prisma.dosen.findUnique({
    where: { id: dosenId },
  });

  if (!dosen || !dosen.isActive) {
    return NextResponse.json({ error: "Dosen tidak aktif" }, { status: 400 });
  }

  if (dosen.kuotaTerpakai >= dosen.kuotaMax) {
    return NextResponse.json(
      { error: "Kuota dosen sudah penuh" },
      { status: 400 }
    );
  }

  // BUAT PENGAJUAN BARU
  await prisma.pengajuan.create({
    data: {
      mahasiswaId,
      dosenId,
      status: "MENUNGGU",
    },
  });

  return NextResponse.json({ success: true });
}
