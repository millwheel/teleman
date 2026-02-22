import Image from "next/image";

type Feature = {
    title: string;
    desc: string;
    imageSrc: string;   // 동그란 아이콘 이미지 경로 (사용자가 교체)
    imageAlt: string;
};

const FEATURES: Feature[] = [
    {
        title: "실시간 빅데이터 검증 시스템",
        desc:
            "보증365는 실시간 빅데이터 분석으로 거래내역, 리뷰, 정산 패턴을 종합 점검합니다. 위험 사이트는 즉시 차단, 안전한 곳만 추천합니다.",
        imageSrc: "/images/scammer-bottom/bottom-1.png",
        imageAlt: "검색 아이콘",
    },
    {
        title: "히스토리 리포트 & 위험도 필터링",
        desc:
            "먹튀·분쟁 이력을 체계적으로 관리하고, 단 한 번이라도 문제된 사이트는 자동 차단! 축적된 데이터로 더욱 정교한 필터링을 제공합니다.",
        imageSrc: "/images/scammer-bottom/bottom-2.png",
        imageAlt: "차트 아이콘",
    },
    {
        title: "전문팀의 직접 모니터링",
        desc:
            "AI 분석에 그치지 않고, 전문 검증팀이 실제 피해 사례와 약관 위반까지 확인합니다. 결과적으로 오직 ‘진짜 안전한 사이트’만 소개합니다.",
        imageSrc:"/images/scammer-bottom/bottom-3.png",
        imageAlt: "문서 아이콘",
    },
    {
        title: "최대 1억원 보증금 예치제도",
        desc:
            "모든 제휴업체는 최대1억원 보증금을 실제 예치해야 등록 가능! 만약 문제가 생기면 보증365가 직접 보상합니다. “실제 보상 가능한 검증업체, 보증365”",
        imageSrc: "/images/scammer-bottom/bottom-4.png",
        imageAlt: "자물쇠 아이콘",
    },
];

export default function ScammerBottom() {
    return (
        <footer className="text-gray-200">
            <div className="mx-auto max-w-6xl px-6 py-16">
                {/* 상단 타이틀 */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-[1px] w-full bg-cyan-400 rounded-full"></div>
                        <h2 className="text-xl md:text-2xl font-bold text-white whitespace-nowrap">
                            <span className="text-cyan-400">텔레맨</span>의 안전검증 시스템이 궁금 하신 가요?
                        </h2>
                        <div className="h-[1px] w-full bg-cyan-400 rounded-full"></div>
                    </div>
                </div>

                {/* 기능 카드들 */}
                <ul
                    className="
                        mt-12 grid gap-4
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                    aria-label="보증365 안전검증 핵심 요소"
                >
                    {FEATURES.map((f, i) => (
                        <li key={i}>
                            <article
                                className="
                                  h-full rounded-2xl bg-[#12161D] ring-1 ring-white/5
                                  shadow-[0_6px_24px_-6px_rgba(0,0,0,0.4)]
                                  p-3 flex flex-col items-center text-center
                                  transition-transform duration-200 hover:-translate-y-0.5
                                "
                            >
                                {/* 동그란 이미지 (사용자 교체 가능) */}
                                <div
                                    className="
                                        relative mb-5
                                        w-24 h-24 md:w-28 md:h-28
                                        rounded-full ring-1 ring-white/10 shadow-lg overflow-hidden
                                    "
                                >
                                    <Image
                                        src={f.imageSrc}
                                        alt={f.imageAlt}
                                        fill
                                        sizes="112px"
                                        className="object-contain p-4 bg-[#0F141B]"
                                        priority={false}
                                    />
                                </div>

                                <h3 className="text-base font-semibold">
                                    {f.title}
                                </h3>

                                {/* 작은 밑줄 포인트 */}
                                <div className="mt-2 h-0.5 w-10 bg-cyan-400/60 rounded-full" />

                                <p className="mt-4 text-sm leading-6 text-gray-300">
                                    {f.desc}
                                </p>
                            </article>
                        </li>
                    ))}
                </ul>

            </div>
        </footer>
    );
}