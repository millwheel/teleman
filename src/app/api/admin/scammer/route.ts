import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { uploadImage, deleteImage, getPublicImageUrl } from "@/lib/storage";
import { PAGE_SIZE } from "@/data/constants";
import { validateFileSize } from "@/util/file";

const SCAMMER_SELECT =
  "id, name, phone_number, bank_account, description, image_path, public_url, created_at";

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
    .select(SCAMMER_SELECT)
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

  const formData = await request.formData();
  const cleanName = (formData.get("name") as string | null)?.trim() || null;
  const cleanPhone = stripHyphens(formData.get("phone_number") as string | null);
  const cleanAccount = stripHyphens(formData.get("bank_account") as string | null);
  const cleanDesc = (formData.get("description") as string | null)?.trim() || null;
  const file = formData.get("image") as File | null;

  if (!cleanName && !cleanPhone && !cleanAccount) {
    return NextResponse.json(
      { message: "이름, 전화번호, 계좌번호 중 최소 하나를 입력하세요." },
      { status: 400 }
    );
  }

  const fileSizeError = validateFileSize(file);
  if (fileSizeError) return fileSizeError;

  let image_path: string | null = null;
  let public_url: string | null = null;

  if (file && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    image_path = `scammers/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      await uploadImage(image_path, buffer, file.type);
      public_url = getPublicImageUrl(image_path);
    } catch (e) {
      console.error("[POST /api/admin/scammer] upload error", e);
      return NextResponse.json(
        { message: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }
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
      image_path,
      public_url,
      created_by: userExists ? session.userId : null,
    })
    .select(SCAMMER_SELECT)
    .single();

  if (error) {
    console.error("[POST /api/admin/scammer] supabase error", error);
    if (image_path) {
      await deleteImage(image_path).catch(() => {});
    }
    return NextResponse.json({ message: "등록 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
