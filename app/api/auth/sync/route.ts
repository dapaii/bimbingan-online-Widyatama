import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";
import { isWidyatamaEmail } from "@/lib/role";

/* ===================== UTIL ===================== */

const parseRole = (value: unknown): Role | null => {
  if (value === Role.MAHASISWA) return Role.MAHASISWA;
  if (value === Role.DOSEN) return Role.DOSEN;
  if (value === Role.KAPRODI) return Role.KAPRODI;
  return null;
};

// muhamad.daffa → Muhamad Daffa
const nameFromEmail = (email: string) => {
  const local = email.split("@")[0] ?? "";
  return local
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

// Reg.A/40622100142/Muhamad → 40622100142
const nimFromDisplayName = (displayName?: string) => {
  if (!displayName) return null;

  const parts = displayName.split("/");
  const nim = parts.find((p) => /^\d{8,20}$/.test(p));

  return nim ?? null;
};

/* ===================== HANDLER ===================== */

export const POST = async () => {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? "";

  if (!isWidyatamaEmail(email)) {
    return new Response("Forbidden", { status: 403 });
  }

  const role = parseRole(user.publicMetadata?.role) ?? Role.MAHASISWA;

  /* ===================== PARSING DATA (FIXED) ===================== */

  const namaMahasiswa = nameFromEmail(email) || user.firstName || "Mahasiswa";

  // 🔥 INI KUNCI PERBAIKANNYA
  const rawIdentity = user.fullName ?? user.firstName ?? user.username ?? "";

  const nimMahasiswa =
    nimFromDisplayName(rawIdentity) ?? `TEMP-${userId.slice(0, 8)}`;

  /* ===================== UPSERT PROFILE ===================== */

  const profile = await prisma.userProfile.upsert({
    where: { clerkUserId: userId },
    update: { role, email },
    create: { clerkUserId: userId, email, role },
  });

  /* ===================== CLEAN ROLE LAMA ===================== */

  if (role === Role.MAHASISWA) {
    await prisma.dosen.deleteMany({ where: { profileId: profile.id } });
  }

  if (role === Role.DOSEN) {
    await prisma.mahasiswa.deleteMany({ where: { profileId: profile.id } });
  }

  /* ===================== CREATE ENTITY ===================== */

  if (role === Role.MAHASISWA) {
    const exist = await prisma.mahasiswa.findUnique({
      where: { profileId: profile.id },
    });

    if (!exist) {
      await prisma.mahasiswa.create({
        data: {
          profileId: profile.id,
          nama: namaMahasiswa,
          nim: nimMahasiswa,
        },
      });
    }
  }

  if (role === Role.DOSEN) {
    const exist = await prisma.dosen.findUnique({
      where: { profileId: profile.id },
    });

    if (!exist) {
      await prisma.dosen.create({
        data: {
          profileId: profile.id,
          nama: user.firstName ?? "Dosen",
          kodeAkses: `AUTO-${profile.id.slice(0, 6)}`,
          kuotaMax: 0,
          isActive: true,
        },
      });
    }
  }

  /* ===================== SYNC METADATA ===================== */

  await clerk.users.updateUser(userId, {
    publicMetadata: {
      role,
      synced: true,
    },
  });

  return Response.json({
    ok: true,
    role,
    nama: namaMahasiswa,
    nim: nimMahasiswa,
  });
};
