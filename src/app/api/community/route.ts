import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/require-auth";
import { processContentImages } from "@/lib/post-image";
import { COMMUNITY_CATEGORIES } from "@/data/communityCategories";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") ?? "free";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  // 카테고리 유효성 검사
  if (!COMMUNITY_CATEGORIES.some((c) => c.key === category)) {
    return NextResponse.json({ message: "잘못된 카테고리입니다." }, { status: 400 });
  }

  const { count } = await supabase
    .from("community")
    .select("*", { count: "exact", head: true })
    .eq("category", category);

  const { data, error } = await supabase
    .from("community")
    .select("id, category, title, author_id, view_count, created_at, updated_at, users!inner(nickname)")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const mapped = (data ?? []).map((row: Record<string, unknown>) => {
    const users = row.users as { nickname: string } | null;
    return {
      id: row.id,
      category: row.category,
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
  const { session, error: authError } = await requireAuth();
  if (authError) return authError;

  const body = await request.json();
  const { category, title, content } = body as { category: string; title: string; content: string };

  if (!category || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ message: "제목과 내용을 입력하세요." }, { status: 400 });
  }

  if (!COMMUNITY_CATEGORIES.some((c) => c.key === category)) {
    return NextResponse.json({ message: "잘못된 카테고리입니다." }, { status: 400 });
  }

  // base64 이미지 처리
  const { html: processedContent } = await processContentImages(content, "community");

  const { data, error } = await supabase
    .from("community")
    .insert({
      category,
      title: title.trim(),
      content: processedContent,
      author_id: session.userId,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
