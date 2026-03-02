"use client";

import Link from "next/link";
import type { JwtPayload } from "@/lib/auth";

type WriteButtonProps = {
  href: string;
  session: JwtPayload | null;
  adminOnly?: boolean;
};

export default function WriteButton({ href, session, adminOnly = false }: WriteButtonProps) {
  if (!session) return null;
  if (adminOnly && session.role !== "admin") return null;

  return (
    <Link
      href={href}
      className="px-4 py-2 bg-primary text-white rounded text-sm hover:opacity-90"
    >
      글쓰기
    </Link>
  );
}
