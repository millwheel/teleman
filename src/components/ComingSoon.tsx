import Link from "next/link";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({
  title,
  description = "현재 준비 중인 페이지입니다. 빠른 시일 내에 오픈할 예정입니다.",
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-8 w-8 text-secondary"
          >
            <path
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-secondary mb-2">{title}</h1>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
        <Link
          href="/links"
          className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-80 transition-colors"
        >
          링크모음으로 이동
        </Link>
      </div>
    </div>
  );
}
