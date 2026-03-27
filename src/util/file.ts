import { NextResponse } from "next/server";

/** 파일 업로드 최대 크기 (4MB) — Vercel Serverless 제한 대응 */
export const MAX_FILE_SIZE = 4 * 1024 * 1024;

export const MAX_FILE_SIZE_LABEL = "4MB";

/**
 * 파일 크기를 검증하고, 초과 시 413 NextResponse를 반환한다.
 * 통과 시 null을 반환한다.
 */
export function validateFileSize(file: File | null): NextResponse | null {
  if (file && file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: `파일 크기가 ${MAX_FILE_SIZE_LABEL}를 초과합니다.` },
      { status: 413 }
    );
  }
  return null;
}
