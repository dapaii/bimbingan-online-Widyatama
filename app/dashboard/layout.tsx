import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  // ❌ JANGAN BALIK KE auth-sync LAGI
  if (!profile) {
    redirect("/unauthorized");
  }

  // optional role guard
  if (profile.role !== "MAHASISWA") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
