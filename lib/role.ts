import { Role } from "@/lib/generated/prisma/client";

export const isWidyatamaEmail = (email: string) => {
  return email.endsWith("@widyatama.ac.id");
};

export const isDosenOrKaprodi = (role: Role) => {
  return role === Role.DOSEN || role === Role.KAPRODI;
};