import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");

    console.log(token);

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!login|api|static|.*\\..*|_next).*)",
};
