import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { PAGE_SIZE } from "@/data/constants";

const COLUMN_MAP: Record<string, string> = {
  name: "name",
  phone: "phone_number",
  account: "bank_account",
};

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") ?? "name";
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(PAGE_SIZE), 10))
  );
  const offset = (page - 1) * limit;

  const column = COLUMN_MAP[type] ?? "name";

  const { count, error: countError } = await supabase
    .from("scammer")
    .select("id", { count: "exact", head: true })
    .ilike(column, `%${q}%`);

  if (countError) {
    return NextResponse.json({ message: "검색 중 오류가 발생했습니다." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("scammer")
    .select("id, name, phone_number, bank_account, description")
    .ilike(column, `%${q}%`)
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ message: "검색 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 검색 통계 집계 (page=1 일 때만 +1)
  if (page === 1) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

    const { data: existing } = await supabase
      .from("scammer_search")
      .select("count")
      .eq("stat_date", today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("scammer_search")
        .update({ count: existing.count + 1 })
        .eq("stat_date", today);
    } else {
      await supabase
        .from("scammer_search")
        .insert({ stat_date: today, count: 1 });
    }
  }

  return NextResponse.json({ items: data ?? [], totalCount: count ?? 0 });
}
