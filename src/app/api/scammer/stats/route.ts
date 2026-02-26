import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  const todayStart = new Date(`${today}T00:00:00+09:00`).toISOString();
  const tomorrowStart = new Date(new Date(`${today}T00:00:00+09:00`).getTime() + 86400000).toISOString();

  const [
    { count: totalScammers },
    { count: todayScammers },
    { data: searchStat },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from("scammer").select("id", { count: "exact", head: true }),
    supabase.from("scammer").select("id", { count: "exact", head: true })
      .gte("created_at", todayStart).lt("created_at", tomorrowStart),
    supabase.from("scammer_search").select("count").eq("stat_date", today).maybeSingle(),
    supabase.from("users").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    totalScammers: totalScammers ?? 0,
    todayScammers: todayScammers ?? 0,
    todaySearches: searchStat?.count ?? 0,
    totalUsers: totalUsers ?? 0,
  });
}
