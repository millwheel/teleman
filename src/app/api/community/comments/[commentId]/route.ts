import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { requireAuth } from "@/lib/require-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const { commentId } = await params;

  const { data: existing } = await supabase
    .from("community_comment")
    .select("author_id")
    .eq("id", Number(commentId))
    .single();

  if (!existing) {
    return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
  }
  if (existing.author_id !== session.userId) {
    return NextResponse.json({ message: "본인의 댓글만 수정할 수 있습니다." }, { status: 403 });
  }

  const body = await request.json();
  const { content } = body as { content: string };

  if (!content?.trim()) {
    return NextResponse.json({ message: "댓글 내용을 입력하세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("community_comment")
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq("id", Number(commentId))
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { commentId } = await params;

  const { data: existing } = await supabase
    .from("community_comment")
    .select("author_id")
    .eq("id", Number(commentId))
    .single();

  if (!existing) {
    return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
  }
  if (existing.author_id !== session.userId && session.role !== "admin") {
    return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await supabase.from("community_comment").delete().eq("id", Number(commentId));
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ message: "삭제되었습니다." });
}
