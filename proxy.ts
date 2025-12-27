import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // ⛔ BYPASS TOTAL untuk API
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  // public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/auth-sync") ||
    pathname.startsWith("/unauthorized")
  ) {
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;

  if (!role) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard/mahasiswa") && role !== "MAHASISWA") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/dashboard/dosen") && role !== "DOSEN") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/dashboard/kaprodi") && role !== "KAPRODI") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
