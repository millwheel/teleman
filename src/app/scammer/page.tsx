import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import ScammerSearchBar from "@/components/ScammerSearchBar";
import Image from "next/image";

async function fetchStats() {
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

  return {
    totalScammers: totalScammers ?? 0,
    todayScammers: todayScammers ?? 0,
    todaySearches: searchStat?.count ?? 0,
    totalUsers: totalUsers ?? 0,
  };
}

export default async function ScammerPage() {
  const [session, stats] = await Promise.all([getSession(), fetchStats()]);

  const STATS = [
    { label: "총 등록 업체수", value: stats.totalScammers },
    { label: "오늘 등록 건수", value: stats.todayScammers },
    { label: "오늘 검색 건수", value: stats.todaySearches },
    { label: "총 회원수",      value: stats.totalUsers },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4">
      <ScammerSearchBar isLoggedIn={!!session} />

      {/* 등록 건수 섹션 */}
      <div className="grid grid-cols-4 gap-4 my-6">
        {STATS.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-6 gap-1.5 border border-gray-300 rounded-xl">
            <span className="text-3xl font-bold tabular-nums text-primary">
              {value.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Static 배너 이미지 */}
      <div className="w-full pt-4">
        <Image
          src="/images/scammer-banner.jpg"
          alt="텔레맨 사기꾼 조회 배너"
          width={1920}
          height={400}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  );
}
