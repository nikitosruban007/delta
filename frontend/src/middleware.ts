import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile-setup",
  "/tournaments",
  "/consultations",
  "/forum",
  "/jury",
];

const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("foldup_token")?.value;

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Note: We don't enforce server-side auth for protected routes here
  // because the token is stored in localStorage (not cookies).
  // Client-side auth checks are done in components via useAuth().
  // For true server-side protection, migrate to httpOnly cookie auth.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public|image|new_assets).*)",
  ],
};
