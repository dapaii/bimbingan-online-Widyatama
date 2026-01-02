import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DosenDashboard from "@/components/dashboard/dosen/DosenDashboard";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: {
      dosen: {
        include: {
          skills: {
            include: { skill: true },
          },
          pengajuan: {
            include: { mahasiswa: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!profile || profile.role !== "DOSEN" || !profile.dosen) {
    redirect("/unauthorized");
  }

  // ambil semua skill master
  const allSkills = await prisma.skill.findMany({
    orderBy: { nama: "asc" },
  });

  const dosen = profile.dosen;

  return (
    <DosenDashboard
      dosen={{
        nama: dosen.nama,
        kuotaMax: dosen.kuotaMax,
        kuotaTerpakai: dosen.kuotaTerpakai,

        // LIST SKILL YANG DIMILIKI DOSEN
        skills: dosen.skills.map(ds => ({
          id: ds.skill.id,
          nama: ds.skill.nama,
        })),

        pengajuan: dosen.pengajuan.map(p => ({
          id: p.id,
          status: p.status,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          mahasiswa: {
            id: p.mahasiswa.id,
            nama: p.mahasiswa.nama,
            nim: p.mahasiswa.nim,
          },
        })),
      }}

      /* ⬇️ tambahan penting */
      allSkills={allSkills}
    />
  );
};

export default Page;
