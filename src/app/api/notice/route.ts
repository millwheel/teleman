import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { processContentImages } from "@/lib/post-image";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  const { count } = await supabase
    .from("notice")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("notice")
    .select("id, title, author_id, view_count, created_at, updated_at, users!inner(nickname)")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const mapped = (data ?? []).map((row: Record<string, unknown>) => {
    const users = row.users as { nickname: string } | null;
    return {
      id: row.id,
      title: row.title,
      author_id: row.author_id,
      author_nickname: users?.nickname ?? "",
      view_count: row.view_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });

  return NextResponse.json({ data: mapped, totalCount: count ?? 0, page, pageSize: PAGE_SIZE });
}

export async function POST(request: NextRequest) {
  const { session, error: authError } = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const { title, content } = body as { title: string; content: string };

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ message: "제목과 내용을 입력하세요." }, { status: 400 });
  }

  const { html: processedContent } = await processContentImages(content, "notice");

  const { data, error } = await supabase
    .from("notice")
    .insert({
      title: title.trim(),
      content: processedContent,
      author_id: session.userId,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
