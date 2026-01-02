import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";


type UpdateMahasiswaPayload = {
  nama: string;
  nim: string;
};

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  let body: UpdateMahasiswaPayload;

  try {
    body = (await req.json()) as UpdateMahasiswaPayload;
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON" },
      { status: 400 }
    );
  }

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

  if (!profile || !profile.mahasiswa) {
    return NextResponse.json(
      { error: "Mahasiswa tidak ditemukan" },
      { status: 404 }
    );
  }

  try {
    await prisma.mahasiswa.update({
      where: { id: profile.mahasiswa.id },
      data: {
        nama,
        nim,
      },
    });
  } catch (err) {
    // 🔥 INI KUNCI MASALAH LO
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "NIM sudah digunakan mahasiswa lain" },
        { status: 409 }
      );
    }

    console.error("UPDATE_MAHASISWA_ERROR", err);

    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
