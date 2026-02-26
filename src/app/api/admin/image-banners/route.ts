import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { uploadImage, getPublicImageUrl } from "@/lib/storage";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("guarantee")
    .select("*")
    .order("created_at");

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  const mapped = (data ?? []).map((b) => ({ ...b, public_url: getPublicImageUrl(b.image_path) }));
  return NextResponse.json(mapped);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const link = formData.get("link") as string;
  const file = formData.get("file") as File | null;

  if (!name || !link || !file) {
    return NextResponse.json({ message: "모든 항목을 입력하세요." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const imagePath = `image-banners/${uuidv4()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadImage(imagePath, buffer, file.type);

  const { data, error: dbError } = await supabase
    .from("guarantee")
    .insert({ name, link, image_path: imagePath, created_by: session.userId })
    .select()
    .single();

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
