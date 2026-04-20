import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for the API secret for the agent status route
  if (pathname.startsWith('/api/agent-status')) {
    const secret = request.headers.get('x-api-secret');
    if (secret === process.env.PIXEL_OFFICE_API_SECRET) {
      return NextResponse.next();
    }
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/branding") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("mc_auth")?.value;
  const expected = process.env.MISSION_CONTROL_TOKEN;

  if (!expected || token === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|branding/).*)"],
};
