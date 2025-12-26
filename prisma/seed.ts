// import crypto from "node:crypto";
// import bcrypt from "bcryptjs";
// import { PrismaClient, Role } from "../lib/generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";

// // 🔌 Adapter khusus CLI / seed
// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL!,
// });

// const prisma = new PrismaClient({ adapter });

// async function main() {
//   console.log("🌱 Seeding database...");

//   /* ===================== SKILL ===================== */
//   await prisma.skill.createMany({
//     data: [
//       { nama: "Artificial Intelligence" },
//       { nama: "Data Science" },
//       { nama: "Web Development" },
//     ],
//     skipDuplicates: true,
//   });

//   /* ===================== ROLE CODE ===================== */
//   const roleCodes = [
//     { role: Role.MAHASISWA, code: "MHS-2025" },
//     { role: Role.KAPRODI, code: "KAP-2025" },
//   ];

//   for (const rc of roleCodes) {
//     await prisma.roleCode.upsert({
//       where: { role: rc.role },
//       update: {},
//       create: {
//         role: rc.role,
//         codeHash: await bcrypt.hash(rc.code, 10),
//       },
//     });
//   }

//   /* ===================== USER KAPRODI ===================== */
//   const kaprodiPassword = await bcrypt.hash("kaprodi123", 10);

//   await prisma.user.upsert({
//     where: { email: "kaprodi@widyatama.ac.id" },
//     update: {},
//     create: {
//       id: crypto.randomUUID(),
//       email: "kaprodi@widyatama.ac.id",
//       passwordHash: kaprodiPassword,
//       role: Role.KAPRODI,
//       isActive: true,
//     },
//   });

//   console.log("✅ Seed selesai dengan aman");
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error("❌ Seed error:", e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
