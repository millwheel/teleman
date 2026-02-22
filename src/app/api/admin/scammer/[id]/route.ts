import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

function stripHyphens(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  return value.replace(/-/g, "").trim();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
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

  const { data, error } = await supabase
    .from("scammer")
    .update({
      name: cleanName,
      phone_number: cleanPhone,
      bank_account: cleanAccount,
      description: cleanDesc,
    })
    .eq("id", numId)
    .select("id, name, phone_number, bank_account, description, created_at")
    .single();

  if (error) {
    return NextResponse.json({ message: "수정 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) {
    return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });
  }

  const { error } = await supabase.from("scammer").delete().eq("id", numId);

  if (error) {
    return NextResponse.json({ message: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
