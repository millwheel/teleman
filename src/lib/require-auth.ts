import { NextResponse } from "next/server";
import { getSession, JwtPayload } from "./auth";

type AuthResult =
  | { session: JwtPayload; error: null }
  | { session: null; error: NextResponse };

export async function requireAuth(): Promise<AuthResult> {
  const session = await getSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 }),
    };
  }
  return { session, error: null };
}
