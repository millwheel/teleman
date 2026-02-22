import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 20;

function stripHyphens(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  return value.replace(/-/g, "").trim();
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const { count, error: countError } = await supabase
    .from("scammer")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("[GET /api/admin/scammer] count error", countError);
    return NextResponse.json({ message: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("scammer")
    .select("id, name, phone_number, bank_account, description, created_at")
    .order("id", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("[GET /api/admin/scammer] select error", error);
    return NextResponse.json({ message: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [], totalCount: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json();
  const cleanName = body.name?.trim() || null;
  const cleanPhone = stripHyphens(body.phone_number);
  const cleanAccount = stripHyphens(body.bank_account);
  const cleanDesc = body.description?.trim() || null;

  if (!cleanName && !cleanPhone && !cleanAccount) {
    return NextResponse.json(
      { message: "이름, 전화번호, 계좌번호 중 최소 하나를 입력하세요." },
      { status: 400 }
    );
  }

  const { data: userExists } = await supabase
    .from("users")
    .select("id")
    .eq("id", session.userId)
    .maybeSingle();

  const { data, error } = await supabase
    .from("scammer")
    .insert({
      name: cleanName,
      phone_number: cleanPhone,
      bank_account: cleanAccount,
      description: cleanDesc,
      created_by: userExists ? session.userId : null,
    })
    .select("id, name, phone_number, bank_account, description, created_at")
    .single();

  if (error) {
    console.error("[POST /api/admin/scammer] supabase error", error);
    return NextResponse.json({ message: "등록 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
