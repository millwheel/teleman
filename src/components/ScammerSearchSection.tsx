"use client";

import ScammerSearchBar from "@/components/ScammerSearchBar";

interface ScammerSearchSectionProps {
  isLoggedIn: boolean;
  type: "name" | "phone" | "account";
  q: string;
}

export default function ScammerSearchSection({
  isLoggedIn,
  type,
  q,
}: ScammerSearchSectionProps) {
  return (
    <div className="bg-secondary py-10">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4">
        <h1 className="text-2xl font-extrabold text-white">사기꾼 조회</h1>
        <ScammerSearchBar isLoggedIn={isLoggedIn} defaultType={type} defaultQ={q} />
      </div>
    </div>
  );
}
