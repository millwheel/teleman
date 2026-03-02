import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { PAGE_SIZE } from "@/data/constants";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { count, error: countError } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("[GET /api/admin/users] count error", countError);
    return NextResponse.json({ message: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, username, nickname, role, is_active, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("[GET /api/admin/users] select error", error);
    return NextResponse.json({ message: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [], totalCount: count ?? 0 });
}
