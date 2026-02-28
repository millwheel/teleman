import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";

export async function GET() {
  const { data, error } = await supabase
    .from("link")
    .select("*")
    .order("likes", { ascending: false });

  if (error) {
    return NextResponse.json({ message: "링크 조회 실패" }, { status: 500 });
  }

  const links = (data ?? []).map((item) => ({
    ...item,
    public_url: item.image_path ? getPublicImageUrl(item.image_path) : null,
  }));

  return NextResponse.json(links);
}
