import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";

export const POST = async (): Promise<Response> => {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const email =
    user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress ?? "";

  // 🔒 RULE MAHASISWA
  if (!email.endsWith("@widyatama.ac.id")) {
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

  // 🔥 SIMPAN ROLE KE CLERK
  await clerk.users.updateUser(userId, {
    publicMetadata: {
      role: "MAHASISWA",
      synced: true,
    },
  });

  return Response.json({ status: "ok" });
};
