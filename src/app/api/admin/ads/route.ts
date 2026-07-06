import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { uploadImage, getPublicImageUrl } from "@/lib/storage";
import { requireAdmin } from "@/lib/admin-auth";
import { validateFileSize } from "@/util/file";
import { isHttpUrl, trimUrl } from "@/util/url";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { data, error: dbError } = await supabase
    .from("ad")
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
  const type = formData.get("type") as string;
  const file = formData.get("file") as File | null;

  if (!name || !link || !type || !file) {
    return NextResponse.json({ message: "모든 항목을 입력하세요." }, { status: 400 });
  }

  const normalizedLink = trimUrl(link);
  if (!isHttpUrl(normalizedLink)) {
    return NextResponse.json(
      { message: "링크는 http:// 또는 https://로 시작해야 합니다." },
      { status: 400 },
    );
  }

  const fileSizeError = validateFileSize(file);
  if (fileSizeError) return fileSizeError;

  if (type !== "long" && type !== "short") {
    return NextResponse.json({ message: "type은 long 또는 short이어야 합니다." }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const imagePath = `ads/${uuidv4()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await uploadImage(imagePath, buffer, file.type);

  const { data, error: dbError } = await supabase
    .from("ad")
    .insert({ name, link: normalizedLink, type, image_path: imagePath, created_by: session.userId })
    .select()
    .single();

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
