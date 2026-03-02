import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";
import { processContentImages, cleanupRemovedImages } from "@/lib/post-image";
import { getPublicImageUrl } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // view_count 증가
  const { data: current } = await supabase
    .from("community")
    .select("view_count")
    .eq("id", Number(id))
    .single();

  if (current) {
    await supabase
      .from("community")
      .update({ view_count: (current.view_count ?? 0) + 1 })
      .eq("id", Number(id));
  }

  const { data, error } = await supabase
    .from("community")
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
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;

  // 본인 확인
  const { data: existing } = await supabase
    .from("community")
    .select("author_id, content")
    .eq("id", Number(id))
    .single();

  if (!existing) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }
  if (existing.author_id !== session.userId) {
    return NextResponse.json({ message: "본인의 글만 수정할 수 있습니다." }, { status: 403 });
  }

  const body = await request.json();
  const { title, content } = body as { title: string; content: string };

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ message: "제목과 내용을 입력하세요." }, { status: 400 });
  }

  // base64 이미지 처리
  const { html: processedContent } = await processContentImages(content, "community", Number(id));

  // 삭제된 이미지 정리
  const bucketBaseUrl = getPublicImageUrl("").replace(/\/$/, "");
  await cleanupRemovedImages(existing.content, processedContent, bucketBaseUrl);

  const { data, error } = await supabase
    .from("community")
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
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;

  const { data: existing } = await supabase
    .from("community")
    .select("author_id")
    .eq("id", Number(id))
    .single();

  if (!existing) {
    return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  // 본인 또는 admin만 삭제 가능
  if (existing.author_id !== session.userId && session.role !== "admin") {
    return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await supabase.from("community").delete().eq("id", Number(id));
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ message: "삭제되었습니다." });
}
