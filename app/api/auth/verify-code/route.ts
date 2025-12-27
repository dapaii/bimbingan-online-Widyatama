import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";
import bcrypt from "bcrypt";

export const POST = async (req: Request) => {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { code } = await req.json();
  if (!code) return new Response("Code required", { status: 400 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  const email =
    user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? "";

  if (!email.endsWith("@widyatama.ac.id")) {
    return new Response("Forbidden", { status: 403 });
  }

  const roleCodes = await prisma.roleCode.findMany();

  let matchedRole: Role | null = null;

  for (const rc of roleCodes) {
    const ok = await bcrypt.compare(code, rc.codeHash);
    if (ok) {
      matchedRole = rc.role;
      break;
    }
  }

  if (!matchedRole) {
    return new Response("Invalid code", { status: 403 });
  }

  await prisma.userProfile.upsert({
    where: { clerkUserId: userId },
    update: { role: matchedRole },
    create: {
      clerkUserId: userId,
      email,
      role: matchedRole,
    },
  });

  await clerk.users.updateUser(userId, {
    publicMetadata: { role: matchedRole, synced: true },
  });

  return Response.json({ role: matchedRole });
};
