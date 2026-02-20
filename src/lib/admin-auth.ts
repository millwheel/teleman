import { NextResponse } from "next/server";
import { getSession, JwtPayload } from "./auth";

type AdminAuthResult =
  | { session: JwtPayload; error: null }
  | { session: null; error: NextResponse };

export async function requireAdmin(): Promise<AdminAuthResult> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ message: "권한이 없습니다." }, { status: 403 }),
    };
  }
  return { session, error: null };
}
