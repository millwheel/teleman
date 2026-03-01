import Image from "next/image";

const FEATURES = [
  {
    title: "실시간 빅데이터 검증 시스템",
    desc: "텔레맨은 실시간 빅데이터 분석으로 거래내역, 리뷰, 정산 패턴을 종합 점검합니다. 위험 사이트는 즉시 차단, 안전한 곳만 추천합니다.",
    imageSrc: "/images/footer/bottom-1.png",
    imageAlt: "검색 아이콘",
  },
  {
    title: "히스토리 리포트 & 위험도 필터링",
    desc: "먹튀·분쟁 이력을 체계적으로 관리하고, 단 한 번이라도 문제된 사이트는 자동 차단! 축적된 데이터로 더욱 정교한 필터링을 제공합니다.",
    imageSrc: "/images/footer/bottom-2.png",
    imageAlt: "차트 아이콘",
  },
  {
    title: "전문팀의 직접 모니터링",
    desc: "AI 분석에 그치지 않고, 전문 검증팀이 실제 피해 사례와 약관 위반까지 확인합니다. 결과적으로 오직 '진짜 안전한 사이트'만 소개합니다.",
    imageSrc: "/images/footer/bottom-3.png",
    imageAlt: "문서 아이콘",
  },
  {
    title: "최대 1억원 보증금 예치제도",
    desc: '모든 제휴업체는 최대1억원 보증금을 실제 예치해야 등록 가능! 만약 문제가 생기면 텔레맨이 직접 보상합니다. "실제 보상 가능한 검증업체, 텔레맨"',
    imageSrc: "/images/footer/bottom-4.png",
    imageAlt: "자물쇠 아이콘",
  },
];

export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4">
      <section className="py-14">
        {/* 중인사 */}
        <div className="mb-10 flex items-center gap-6">
          <hr className="flex-1 border-secondary" />
          <div className="text-center shrink-0">
            <h2 className="text-2xl font-extrabold text-primary md:text-3xl">
              텔레맨의
            </h2>
            <p className="mt-1 text-lg font-semibold text-primary md:text-xl">
              안전검증 시스템이 궁금 하신가요?
            </p>
          </div>
          <hr className="flex-1 border-secondary" />
        </div>

        {/* 카드들 */}
        <ul
          className="mt-12 grid gap-4 grid-cols-2 md:grid-cols-4"
          aria-label="안전검증 핵심 요소"
        >
          {FEATURES.map((f, i) => (
            <li key={i}>
              <div className="h-full gap-10 p-3 flex flex-col items-center text-center">
                <h3 className="text-base font-semibold text-primary">
                  {f.title}
                </h3>
                <div className="relative w-20 h-20 md:w-28 md:h-28 overflow-hidden">
                  <Image
                    src={f.imageSrc}
                    alt={f.imageAlt}
                    fill
                    sizes="112px"
                    className="object-contain"
                    priority={false}
                  />
                </div>
                <p className="text-xs leading-6 text-primary">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </footer>
  );
}
