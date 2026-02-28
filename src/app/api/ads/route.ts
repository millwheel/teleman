import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";

export async function GET() {
  const { data, error } = await supabase.from("ad").select("*");

  if (error) {
    return NextResponse.json({ message: "광고 조회 실패" }, { status: 500 });
  }

  const banners = (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    link: b.link,
    type: b.type as "long" | "short",
    public_url: getPublicImageUrl(b.image_path),
  }));

  return NextResponse.json(banners);
}
