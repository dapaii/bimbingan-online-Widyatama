import bcrypt from "bcrypt";
import prisma from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";

/* ===================== DOSEN SEED ===================== */
const seedDosen = async () => {
  console.log("🌱 Seeding DOSEN PEMBIMBING...");

  /* ===================== SKILL ===================== */
  const skills = [
    "Web Development",
    "Machine Learning",
    "Computer Vision",
    "Data Mining",
    "UI/UX",
    "Internet of Things",
  ];

  const skillRecords = await Promise.all(
    skills.map((nama) =>
      prisma.skill.upsert({
        where: { nama },
        update: {},
        create: { nama },
      })
    )
  );

  const skillMap = Object.fromEntries(skillRecords.map((s) => [s.nama, s.id]));

  /* ===================== DOSEN DATA ===================== */
  const dosenList = [
    {
      nama: "Dr. Viddi Mardiansyah, S.Si., M.T.",
      email: "viddi@widyatama.ac.id",
      kodePlain: "DOSEN-VIDDI-2025",
      kuotaMax: 10,
      skills: ["Web Development", "UI/UX"],
    },
    {
      nama: "Dr. Andi Wijaya, M.Kom.",
      email: "andi@widyatama.ac.id",
      kodePlain: "DOSEN-ANDI-2025",
      kuotaMax: 8,
      skills: ["Machine Learning", "Data Mining"],
    },
    {
      nama: "Ir. Rina Kusuma, M.T.",
      email: "rina@widyatama.ac.id",
      kodePlain: "DOSEN-RINA-2025",
      kuotaMax: 6,
      skills: ["Computer Vision", "Machine Learning"],
    },
  ];

  /* ===================== RESET DOSEN ===================== */
  await prisma.dosenSkill.deleteMany();
  await prisma.dosen.deleteMany({
    where: {
      profile: { role: Role.DOSEN },
    },
  });
  await prisma.userProfile.deleteMany({
    where: { role: Role.DOSEN },
  });

  /* ===================== CREATE DOSEN ===================== */
  for (const dosen of dosenList) {
    const kodeHash = await bcrypt.hash(dosen.kodePlain, 10);

    const profile = await prisma.userProfile.create({
      data: {
        clerkUserId: `seed-${dosen.email}`,
        email: dosen.email,
        role: Role.DOSEN,
      },
    });

    const dosenRecord = await prisma.dosen.create({
      data: {
        profileId: profile.id,
        nama: dosen.nama,
        kodeAkses: kodeHash, // 🔐 HASHED
        kuotaMax: dosen.kuotaMax,
        isActive: true,
      },
    });

    for (const skillName of dosen.skills) {
      await prisma.dosenSkill.create({
        data: {
          dosenId: dosenRecord.id,
          skillId: skillMap[skillName],
        },
      });
    }

    // hanya ditampilkan sekali (DEV ONLY)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👨‍🏫 DOSEN :", dosen.nama);
    console.log("📧 EMAIL :", dosen.email);
    console.log("🔑 KODE  :", dosen.kodePlain);
  }

  console.log("✅ DOSEN SEEDED DENGAN AMAN");
};

/* ===================== MAIN ===================== */
const main = async () => {
  await seedDosen();
};

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
