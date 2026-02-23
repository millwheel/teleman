import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";

export async function GET() {
  const { data, error } = await supabase.from("image_banner").select("*");
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const mapped = (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    link: b.link,
    public_url: getPublicImageUrl(b.image_path),
  }));

  return NextResponse.json(mapped);
}
