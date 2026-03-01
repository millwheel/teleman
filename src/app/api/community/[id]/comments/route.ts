import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/require-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("community_comment")
    .select("*, users!inner(nickname)")
    .eq("post_id", Number(id))
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const mapped = (data ?? []).map((row: Record<string, unknown>) => {
    const users = row.users as { nickname: string } | null;
    return {
      id: row.id,
      post_id: row.post_id,
      author_id: row.author_id,
      author_nickname: users?.nickname ?? "",
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });

  return NextResponse.json(mapped);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const { id } = await params;
  const body = await request.json();
  const { content } = body as { content: string };

  if (!content?.trim()) {
    return NextResponse.json({ message: "댓글 내용을 입력하세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("community_comment")
    .insert({ post_id: Number(id), author_id: session.userId, content: content.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
