import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabase";
import { uploadImage, deleteImage, getPublicImageUrl } from "@/lib/storage";
import { requireAdmin } from "@/lib/admin-auth";
import { processContentImages, cleanupRemovedImages } from "@/lib/post-image";
import { validateFileSize } from "@/util/file";
import { isHttpUrl, trimUrl } from "@/util/url";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const link = formData.get("link") as string;
  const description = formData.get("description") as string;
  const likes = parseInt(formData.get("likes") as string) || 0;
  const file = formData.get("file") as File | null;
  const existing_image_path = formData.get("image_path") as string | null;

  if (!name || !link) {
    return NextResponse.json({ message: "name과 link를 입력하세요." }, { status: 400 });
  }

  const normalizedLink = trimUrl(link);
  if (!isHttpUrl(normalizedLink)) {
    return NextResponse.json(
      { message: "링크는 http:// 또는 https://로 시작해야 합니다." },
      { status: 400 },
    );
  }

  const { data: existing } = await supabase
    .from("link")
    .select("description")
    .eq("id", Number(id))
    .single();

  const fileSizeError = validateFileSize(file);
  if (fileSizeError) return fileSizeError;

  let image_path = existing_image_path;
  if (file && file.size > 0) {
    if (existing_image_path) await deleteImage(existing_image_path);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    image_path = `links/${id}/thumbnail/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadImage(image_path, buffer, file.type);
  }

  let processedDesc = description || null;
  if (description) {
    const { html } = await processContentImages(description, `links/${id}/content`);
    processedDesc = html;
    if (existing?.description) {
      const bucketBaseUrl = getPublicImageUrl("").replace(/\/$/, "");
      await cleanupRemovedImages(existing.description, html, bucketBaseUrl);
    }
  }

  const { data, error: dbError } = await supabase
    .from("link")
    .update({ name, link: normalizedLink, description: processedDesc, likes, image_path })
    .eq("id", id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const { error: dbError } = await supabase
    .from("link")
    .delete()
    .eq("id", id);

  if (dbError) return NextResponse.json({ message: dbError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
