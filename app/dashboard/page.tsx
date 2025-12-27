import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import MahasiswaDashboard from "@/app/dashboard/mahasiswa/page";
import DosenDashboard from "@/components/dashboard/DosenDashboard";
import KaprodiDashboard from "@/components/dashboard/KaprodiDashboard";

const Page = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  if (!profile) redirect("/unauthorized");

  if (profile.role === "DOSEN") return <DosenDashboard />;
  if (profile.role === "KAPRODI") return <KaprodiDashboard />;

  return <MahasiswaDashboard />;
};

export default Page;
