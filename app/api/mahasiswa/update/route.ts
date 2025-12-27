import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { nama, nim } = body;

  if (!nama || !nim) {
    return NextResponse.json(
      { error: "Nama dan NIM wajib diisi" },
      { status: 400 }
    );
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { mahasiswa: true },
  });

  if (!profile?.mahasiswa) {
    return NextResponse.json(
      { error: "Mahasiswa tidak ditemukan" },
      { status: 404 }
    );
  }

  await prisma.mahasiswa.update({
    where: { id: profile.mahasiswa.id },
    data: {
      nama,
      nim,
    },
  });

  return NextResponse.json({ success: true });
}
