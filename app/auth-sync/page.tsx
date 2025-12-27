"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Page = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || ran.current) return;
    ran.current = true;

    fetch("/api/auth/sync", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("sync failed");

        const role = user?.publicMetadata?.role;

        if (!role) {
          router.replace("/auth/choose-role");
        } else {
          router.replace("/dashboard");
        }
      })
      .catch(() => router.replace("/unauthorized"));
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">
        Menyiapkan akun…
      </p>
    </div>
  );
};

export default Page;
