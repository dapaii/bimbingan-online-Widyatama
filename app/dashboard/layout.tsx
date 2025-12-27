// app/dashboard/layout.tsx
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  if (!profile) redirect("/unauthorized");

  return <>{children}</>;
};

export default DashboardLayout;
