import prisma from "@/lib/db";
import { Role, PengajuanStatus } from "@/lib/generated/prisma/client";

/* ===================== DATA MAHASISWA ===================== */
const mahasiswaList = [
  {
    nama: "Ahmad Rizki",
    nim: "4062210001",
    email: "rizki@student.widyatama.ac.id",
  },
  {
    nama: "Siti Aulia",
    nim: "4062210002",
    email: "aulia@student.widyatama.ac.id",
  },
  {
    nama: "Bima Pratama",
    nim: "4062210003",
    email: "bima@student.widyatama.ac.id",
  },
];

/* ===================== MAIN SEED ===================== */
const seedMahasiswaDanPengajuan = async () => {
  console.log("🌱 Seeding MAHASISWA & PENGAJUAN...");

  // ambil semua dosen aktif
  const dosenList = await prisma.dosen.findMany({
    where: { isActive: true },
  });

  if (dosenList.length === 0) {
    throw new Error(" Tidak ada dosen aktif. Jalankan seed dosen dulu.");
  }

  let dosenIndex = 0;

  for (const mhs of mahasiswaList) {
    /* ===================== USER PROFILE ===================== */
    const profile = await prisma.userProfile.upsert({
      where: { clerkUserId: `seed-${mhs.email}` },
      update: {},
      create: {
        clerkUserId: `seed-${mhs.email}`,
        email: mhs.email,
        role: Role.MAHASISWA,
      },
    });

    /* ===================== MAHASISWA ===================== */
    const mahasiswa = await prisma.mahasiswa.upsert({
      where: { nim: mhs.nim },
      update: {
        nama: mhs.nama,
      },
      create: {
        profileId: profile.id,
        nim: mhs.nim,
        nama: mhs.nama,
      },
    });

    /* ===================== PILIH DOSEN (ROTASI) ===================== */
    const dosen = dosenList[dosenIndex % dosenList.length];
    dosenIndex++;

    /* ===================== BUAT PENGAJUAN ===================== */
    const existing = await prisma.pengajuan.findUnique({
      where: { mahasiswaId: mahasiswa.id },
    });

    if (!existing) {
      await prisma.pengajuan.create({
        data: {
          mahasiswaId: mahasiswa.id,
          dosenId: dosen.id,
          status: PengajuanStatus.MENUNGGU,
        },
      });

      // optional: naikkan kuota TERPAKAI kalau mau simulasi
      await prisma.dosen.update({
        where: { id: dosen.id },
        data: {
          kuotaTerpakai: { increment: 1 },
        },
      });
    }

    console.log(`✅ Mahasiswa seeded: ${mhs.nama}`);
  }

  console.log("🎉 SEED MAHASISWA + PENGAJUAN SELESAI");
};

/* ===================== RUNNER ===================== */
const main = async () => {
  await seedMahasiswaDanPengajuan();
};

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
