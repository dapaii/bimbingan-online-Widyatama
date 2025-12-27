import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const getProfile = async () => {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });
};