import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/* ================= TYPES ================= */

type AuthResult =
  | { ok: true }
  | { ok: false; code: "UNAUTHORIZED" | "FORBIDDEN" };

type CreateSkillPayload = {
  nama: string;
};

type UpdatePayload = {
  dosenId: string;
  kuotaMax?: number;
  isActive?: boolean;
};

/* ================= AUTH ================= */

const authorizeKaprodi = async (): Promise<AuthResult> => {
  const { userId } = await auth();
  if (!userId) return { ok: false, code: "UNAUTHORIZED" };

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });

  if (!profile || profile.role !== "KAPRODI") {
    return { ok: false, code: "FORBIDDEN" };
  }

  return { ok: true };
};

/* ================= GET ================= */
/**
 * Ambil dosen + master skill
 */
export const GET = async () => {
  const authResult = await authorizeKaprodi();
  if (!authResult.ok) {
    return NextResponse.json(
      { message: authResult.code },
      { status: authResult.code === "FORBIDDEN" ? 403 : 401 }
    );
  }

  const dosen = await prisma.dosen.findMany({
    include: {
      profile: { select: { email: true } },
      skills: { include: { skill: true } },
    },
    orderBy: { nama: "asc" },
  });

  const skills = await prisma.skill.findMany({
    orderBy: { nama: "asc" },
  });

  return NextResponse.json({ dosen, skills });
};

/* ================= POST ================= */
/**
 * Tambah MASTER skill
 */
export const POST = async (req: Request) => {
  const authResult = await authorizeKaprodi();
  if (!authResult.ok) {
    return NextResponse.json(
      { message: authResult.code },
      { status: authResult.code === "FORBIDDEN" ? 403 : 401 }
    );
  }

  const body = (await req.json()) as CreateSkillPayload;

  if (!body.nama || body.nama.trim().length === 0) {
    return NextResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
  }

  const skill = await prisma.skill.create({
    data: { nama: body.nama.trim() },
  });

  return NextResponse.json(skill);
};

/* ================= PATCH ================= */
/**
 * Update DOSEN
 * - kuotaMax
 * - isActive
 */
export const PATCH = async (req: Request) => {
  const authResult = await authorizeKaprodi();
  if (!authResult.ok) {
    return NextResponse.json(
      { message: authResult.code },
      { status: authResult.code === "FORBIDDEN" ? 403 : 401 }
    );
  }

  const body = (await req.json()) as UpdatePayload;

  if (!body.dosenId) {
    return NextResponse.json({ message: "BAD_REQUEST" }, { status: 400 });
  }

  const dosen = await prisma.dosen.findUnique({
    where: { id: body.dosenId },
    select: {
      kuotaTerpakai: true,
    },
  });

  if (!dosen) {
    return NextResponse.json({ message: "DOSEN_NOT_FOUND" }, { status: 404 });
  }

  /* ===== VALIDASI KUOTA ===== */
  if (
    typeof body.kuotaMax === "number" &&
    body.kuotaMax < dosen.kuotaTerpakai
  ) {
    return NextResponse.json(
      { message: "KUOTA_LESS_THAN_USED" },
      { status: 409 }
    );
  }

  const updated = await prisma.dosen.update({
    where: { id: body.dosenId },
    data: {
      ...(typeof body.kuotaMax === "number" ? { kuotaMax: body.kuotaMax } : {}),
      ...(typeof body.isActive === "boolean"
        ? { isActive: body.isActive }
        : {}),
    },
  });

  return NextResponse.json(updated);
};
