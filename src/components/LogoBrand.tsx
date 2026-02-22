import Image from "next/image";
import Link from "next/link";

export default function LogoBrand() {
  return (
    <Link href="/links" className="flex items-center gap-3">
      <Image
        src="/images/logo.png"
        alt="텔레맨 로고"
        width={56}
        height={56}
        className="rounded-lg"
        priority
      />
      <div className="flex items-center gap-2">
        <span className="text-5xl font-bold tracking-tight text-primary">
          텔레맨
        </span>
        <div className="flex flex-col text-xs font-semibold text-primary leading-tight">
          <span>텔레그램</span>
          <span>홍보방</span>
          <span>안전거래</span>
        </div>
      </div>
    </Link>
  );
}
