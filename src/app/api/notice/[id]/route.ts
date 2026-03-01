import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { getSession } from "@/lib/auth";
import { processContentImages, cleanupRemovedImages } from "@/lib/post-image";
import { getPublicImageUrl } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // view_count 증가
  const { data: current } = await supabase
    .from("notice")
    .select("view_count")
    .eq("id", Number(id))
    .single();

  if (current) {
    await supabase
      .from("notice")
      .update({ view_count: (current.view_count ?? 0) + 1 })
      .eq("id", Number(id));
  }

  const { data, error } = await supabase
    .from("notice")
    .select("*, users!inner(nickname)")
    .eq("id", Number(id))
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const users = data.users as { nickname: string } | null;
  return NextResponse.json({
    ...data,
    users: undefined,
    author_nickname: users?.nickname ?? "",
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;

  const { data: existing } = await supabase
    .from("notice")
    .select("content")
    .eq("id", Number(id))
    .single();

  if (!existing) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await request.json();
  const { title, content } = body as { title: string; content: string };

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ message: "제목과 내용을 입력하세요." }, { status: 400 });
  }

  const { html: processedContent } = await processContentImages(content, "notice");

  const bucketBaseUrl = getPublicImageUrl("").replace(/\/$/, "");
  await cleanupRemovedImages(existing.content, processedContent, bucketBaseUrl);

  const { data, error } = await supabase
    .from("notice")
    .update({ title: title.trim(), content: processedContent, updated_at: new Date().toISOString() })
    .eq("id", Number(id))
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;

  const { error } = await supabase.from("notice").delete().eq("id", Number(id));
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ message: "삭제되었습니다." });
}
