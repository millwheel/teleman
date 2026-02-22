import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import ScammerSearchBar from "@/components/ScammerSearchBar";

const FEATURES = [
  {
    title: "실시간 빅데이터 검증 시스템",
    icon: "🔍",
    desc: "실시간 빅데이터 분석으로 거래내역, 리뷰, 정산 패턴을 종합 점검합니다. 위험 사이트는 즉시 차단, 안전한 곳만 추천합니다.",
  },
  {
    title: "히스토리 리포트 & 위험도 필터링",
    icon: "📈",
    desc: "먹튀·분쟁 이력을 체계적으로 관리하고, 단 한 번이라도 문제된 사이트는 자동 차단! 축적된 데이터로 더욱 정교한 필터링을 제공합니다.",
  },
  {
    title: "전문팀의 직접 모니터링",
    icon: "📋",
    desc: "AI 분석에 그치지 않고, 전문 검증팀이 실제 피해 사례와 약관 위반까지 확인합니다. 결과적으로 오직 '진짜 안전한 사이트'만 소개합니다.",
  },
  {
    title: "최대 1억원 보증금 예치제도",
    icon: "🔒",
    desc: '모든 제휴업체는 최대 1억원 보증금을 실제 예치해야 등록 가능! 만약 문제가 생기면 직접 보상합니다. "실제 보상 가능한 검증업체"',
  },
];

export default async function ScammerPage() {
  const session = await getSession();

  return (
    <div>
      {/* Hero 섹션 */}
      <section className="bg-secondary py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight md:text-4xl">
            사기꾼 조회
          </h1>
          <p className="mb-8 text-sm text-white/80">
            한눈에 확인되는, 믿을 수 있는 검증조건
          </p>
          <div className="flex justify-center">
            <Suspense fallback={<div className="h-12 w-full max-w-2xl rounded-lg bg-white/20" />}>
              <ScammerSearchBar isLoggedIn={!!session} />
            </Suspense>
          </div>
          <p className="mt-5 text-xs text-white/70">
            텔레맨은 고객의 안전을 위해 자체 검증 시스템을 활용하여 실시간 검증 시스템으로
            누구보다 정확한 정보와 안정적인 서비스를 제공합니다.
          </p>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="py-14">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold text-primary md:text-3xl">텔레맨의</h2>
            <p className="mt-1 text-lg font-semibold text-gray-700 md:text-xl">
              안전검증 시스템이 궁금 하신가요?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-3xl shadow-md">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-sm font-bold text-secondary underline">{f.title}</h3>
                <p className="text-xs leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
