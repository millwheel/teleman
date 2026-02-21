import Link from "next/link";

const MENU = [
  { label: "관리자 관리", href: "/admin/members", desc: "관리자 계정 추가 및 관리" },
  { label: "링크모음 관리", href: "/admin/text-banner", desc: "카테고리 및 링크 배너 관리" },
  { label: "보증업체 관리", href: "/admin/image-banner", desc: "보증업체 이미지 배너 관리" },
  { label: "광고배너 관리", href: "/admin/common-banner", desc: "메인 페이지 공통 광고 배너 관리" },
];

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold text-foreground mb-8">관리자 메뉴</h1>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {MENU.map(({ label, href, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 hover:border-primary hover:shadow-sm transition-all group"
          >
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary">
                {label}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">{desc}</p>
            </div>
            <span className="text-gray-300 group-hover:text-primary text-lg">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
