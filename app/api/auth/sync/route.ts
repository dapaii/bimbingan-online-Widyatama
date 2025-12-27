import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";
import { isWidyatamaEmail } from "@/lib/role";

export const POST = async () => {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const email =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? "";

  if (!isWidyatamaEmail(email)) {
    return new Response("Forbidden", { status: 403 });
  }

  const existing = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
  });

  if (!existing) {
    await prisma.userProfile.create({
      data: {
        clerkUserId: userId,
        email,
        role: Role.MAHASISWA,
      },
    });
  }

  await clerk.users.updateUser(userId, {
    publicMetadata: {
      role: "MAHASISWA",
      synced: true,
    },
  });

  return Response.json({ ok: true });
};
