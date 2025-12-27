"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const Page = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-8 shadow-sm">
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Pilih Peran Akses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tentukan peran untuk melanjutkan ke dashboard
          </p>
        </div>

        {/* ACTION */}
        <div className="mt-8 space-y-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.replace("/dashboard")}
          >
            Masuk sebagai Mahasiswa
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() =>
              router.replace("/dashboard/verify-code?role=DOSEN")
            }
          >
            Masuk sebagai Dosen / Kaprodi
          </Button>
        </div>

        {/* FOOTER */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Akses dosen dan kaprodi memerlukan kode verifikasi
        </p>
      </div>
    </div>
  );
};

export default Page;
