"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const AuthSyncPage = () => {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || ran.current) return;
    ran.current = true;

    fetch("/api/auth/sync", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("sync failed");
        router.replace("/dashboard");
      })
      .catch(() => router.replace("/unauthorized"));
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-gray-500">Menyiapkan akun…</p>
    </div>
  );
};

export default AuthSyncPage;
