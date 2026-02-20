import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "텔레맨 - 텔레그램 홍보방 안전거래",
  description: "텔레맨 링크모음, 보증업체, 사기꾼조회",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
