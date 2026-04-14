import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const password = body?.password ?? "";
  const expected = process.env.MISSION_CONTROL_TOKEN;

  if (!expected) {
    return NextResponse.json({ ok: true }); // No token configured = open access
  }

  if (password !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const next = body?.next ?? "/";
  const response = NextResponse.json({ ok: true, redirect: next });
  response.cookies.set("mc_auth", expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("mc_auth");
  return response;
}
