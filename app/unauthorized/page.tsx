import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const page = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm rounded-xl border border-muted bg-background px-6 py-8 shadow-md">
        
        {/* ICON */}
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border bg-muted text-muted-foreground">
          <ShieldAlert className="h-5 w-5" />
        </div>

        {/* TITLE */}
        <h1 className="text-center text-lg font-semibold leading-tight">
          Akses Tidak Diizinkan
        </h1>

        <p className="mt-1 text-center text-sm text-muted-foreground">
          Kamu tidak memiliki izin untuk membuka halaman ini
        </p>

        <Separator className="my-5" />

        {/* BODY */}
        <div className="space-y-3 text-center text-sm text-muted-foreground">
          <p>
            Sistem ini hanya dapat diakses oleh
            <br />
            <span className="font-medium text-foreground">
              Mahasiswa Universitas Widyatama
            </span>
          </p>

          <div className="mx-auto w-fit rounded-md bg-muted px-3 py-1 font-mono text-xs">
            @widyatama.ac.id
          </div>

          <p className="text-xs leading-relaxed">
            Untuk <b>Dosen</b> atau <b>Kaprodi</b>, silakan masuk melalui jalur
            khusus menggunakan kode akses yang valid.
          </p>
        </div>

        {/* ACTION */}
        <div className="mt-6">
          <Button asChild className="w-full" variant="default">
            <Link href="/">Kembali ke Login</Link>
          </Button>
        </div>

        {/* FOOTER */}
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Error 403 · Unauthorized Access
        </p>
      </Card>
    </div>
  );
};

export default page;
