import bcrypt from "bcrypt";
import prisma from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";

const seedRoleCodes = async () => {
  // JANGAN SIMPAN PLAIN DI DB
  const DOSEN_CODE = "DOSEN-IMK-2025";
  const KAPRODI_CODE = "KAPRODI-IMK-2025";

  const dosenHash = await bcrypt.hash(DOSEN_CODE, 10);
  const kaprodiHash = await bcrypt.hash(KAPRODI_CODE, 10);

  // reset biar ga tabrakan unique role
  await prisma.roleCode.deleteMany();

  await prisma.roleCode.createMany({
    data: [
      {
        role: Role.DOSEN,
        codeHash: dosenHash,
      },
      {
        role: Role.KAPRODI,
        codeHash: kaprodiHash,
      },
    ],
  });

  console.log("✅ ROLE CODE SEEDED");
  console.log("DOSEN   :", DOSEN_CODE);
  console.log("KAPRODI :", KAPRODI_CODE);
};

const main = async () => {
  await seedRoleCodes();
};

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
