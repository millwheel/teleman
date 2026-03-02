import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { uploadImage, getPublicImageUrl } from "@/lib/storage";
import { requireAdmin } from "@/lib/admin-auth";
import { LINK_CATEGORIES } from "@/data/linkCategories";
import { processContentImages } from "@/lib/post-image";

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

  // 파일을 미리 읽어 둔다 (insert 후 ID를 얻어야 경로 생성 가능)
  const fileBuffer = file && file.size > 0 ? Buffer.from(await file.arrayBuffer()) : null;
  const fileExt = file ? (file.name.split(".").pop()?.toLowerCase() ?? "jpg") : null;

  const { data, error: dbError } = await supabase
    .from("link")
    .insert({
      category_code,
      name,
      link,
      description: description || null,
      likes,
      image_path: "",
      created_by: session.userId,
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });

  const updates: Record<string, string> = {};

  if (fileBuffer && fileExt && file) {
    const image_path = `links/${data.id}/thumbnail/${uuidv4()}.${fileExt}`;
    await uploadImage(image_path, fileBuffer, file.type);
    updates.image_path = image_path;
  }

  if (description) {
    const { html } = await processContentImages(description, `links/${data.id}/content`);
    if (html !== description) {
      updates.description = html;
    }
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("link").update(updates).eq("id", data.id);
    Object.assign(data, updates);
  }

  return NextResponse.json(data, { status: 201 });
}
