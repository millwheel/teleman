import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { uploadImage, getPublicImageUrl } from "@/lib/storage";
import { requireAdmin } from "@/lib/admin-auth";
import { LINK_CATEGORIES } from "@/data/linkCategories";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const categoryCode = searchParams.get("categoryCode");

  let query = supabase.from("link").select("*").order("likes", { ascending: false });
  if (categoryCode) {
    query = query.eq("category_code", categoryCode);
  }

  const { data, error: dbError } = await query;
  if (dbError) {
    console.error("[GET /api/admin/links] dbError:", dbError);
    return NextResponse.json({ message: dbError.message }, { status: 500 });
  }

  const mapped = (data ?? []).map((b) => ({
    ...b,
    public_url: b.image_path ? getPublicImageUrl(b.image_path) : null,
  }));
  return NextResponse.json(mapped);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const formData = await request.formData();
  const category_code = formData.get("category_code") as string;
  const name = formData.get("name") as string;
  const link = formData.get("link") as string;
  const description = formData.get("description") as string;
  const likes = parseInt(formData.get("likes") as string) || 0;
  const file = formData.get("file") as File | null;

  if (!LINK_CATEGORIES.find((c) => c.code === category_code) || !name || !link) {
    return NextResponse.json({ message: "모든 항목을 입력하세요." }, { status: 400 });
  }

  // 카테고리당 최대 10개 제한
  const { count } = await supabase
    .from("link")
    .select("*", { count: "exact", head: true })
    .eq("category_code", category_code);

  if ((count ?? 0) >= 10) {
    return NextResponse.json(
      { message: "카테고리당 최대 10개까지 등록할 수 있습니다." },
      { status: 400 }
    );
  }

  let image_path: string | null = null;
  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    image_path = `links/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadImage(image_path, buffer, file.type);
  }

  const { data, error: dbError } = await supabase
    .from("link")
    .insert({
      category_code,
      name,
      link,
      description: description || null,
      likes,
      image_path,
      created_by: session.userId,
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
