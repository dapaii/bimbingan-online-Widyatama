import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // 🌍 PUBLIC ROUTES
  if (
    pathname === "/" ||
    pathname.startsWith("/auth-sync") ||
    pathname.startsWith("/unauthorized") ||
    pathname === "/api/auth/sync"
  ) {
    return NextResponse.next();
  }

  // ❌ BELUM LOGIN
  if (!userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ LOGIN AJA CUKUP
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|favicon.ico).*)",
    "/api/(.*)",
  ],
};
