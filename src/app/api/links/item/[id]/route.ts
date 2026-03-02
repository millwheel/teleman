import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("link")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "링크를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    ...data,
    public_url: data.image_path ? getPublicImageUrl(data.image_path) : null,
  });
}
