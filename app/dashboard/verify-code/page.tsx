"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Page = () => {
  const [code, setCode] = useState("");
  const router = useRouter();

  const submit = async () => {
    const res = await fetch("/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      router.replace("/dashboard");
    } else {
      alert("Kode salah");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border p-6">
        <h1 className="text-center font-semibold">
          Verifikasi Kode Dosen / Kaprodi
        </h1>

        <Input
          className="mt-4"
          placeholder="Masukkan kode akses"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <Button className="mt-4 w-full" onClick={submit}>
          Verifikasi
        </Button>
      </div>
    </div>
  );
};

export default Page;
