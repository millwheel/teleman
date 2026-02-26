import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import ScammerSearchBar from "@/components/ScammerSearchBar";
import Image from "next/image";

type ScammerStats = {
  totalScammers: number;
  todayScammers: number;
  todaySearches: number;
  totalUsers: number;
};

export default async function ScammerPage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const [session, res] = await Promise.all([
    getSession(),
    fetch(`${proto}://${host}/api/scammer/stats`),
  ]);

  const stats: ScammerStats = await res.json();

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
