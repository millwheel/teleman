# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 실행
```

## Architecture

**Next.js 16 App Router** 기반 프로젝트. 테스트 코드 없음.

### Route Groups

| 경로 | 설명 |
|------|------|
| `src/app/(main)/` | 일반 사용자 페이지 (헤더/푸터 레이아웃 포함) |
| `src/app/(auth)/` | 로그인·회원가입 페이지 |
| `src/app/admin/` | 관리자 페이지 — layout에서 세션 검증 및 role 체크 후 redirect |
| `src/app/api/` | API Route Handlers |

### 데이터베이스 (Supabase)

`src/lib/supabase.ts`의 `supabase` 클라이언트는 **API route에서만** 사용. page 컴포넌트에서 직접 호출하지 않음.

**테이블명:**
- `common_banner` — 광고 배너 (type: `'long'` | `'short'`)
- `guarantee` — 보증업체 배너
- `link` — 링크모음 항목 (구 text_banners)
- `link_category` — 링크모음 카테고리. **DB가 아닌 `src/data/linkCategories.ts`의 `LINK_CATEGORIES` 상수로 static 관리.**
- `scammer` / `scammer_search` — 사기꾼 조회
- `users` — 회원

**Storage:** `public-media` 버킷, 
`src/lib/storage.ts`의 `uploadImage` / `getPublicImageUrl` / `deleteImage` 사용.
**`storage.ts`는 `route.ts`에서만 호출한다.**

### 인증

JWT (`jose`)를 httpOnly 쿠키 `teleman_session`에 저장. 7일 만료.

- `getSession()` — `src/lib/auth.ts`. 세션 쿠키를 읽어 JWT 검증 후 `JwtPayload` 반환
- `requireAdmin()` — `src/lib/admin-auth.ts`. API route에서 관리자 권한 확인에 사용
- `admin/layout.tsx`에서 페이지 레벨 admin 가드 처리

### Server Component에서 내부 API 호출 패턴

서버 컴포넌트에서 내부 API를 fetch할 때 `headers()`로 host를 추출해 절대 URL 구성:

```ts
const headersList = await headers();
const host = headersList.get("host")!;
const proto = process.env.NODE_ENV === "production" ? "https" : "http";
const res = await fetch(`${proto}://${host}/api/...`);
```

쿠키는 자동 전달되므로 인증이 필요한 API도 동일하게 호출 가능.

### 공유 모듈

- **`src/data/type.ts`** — 모든 도메인 타입 정의. `interface` 대신 `type` 사용.
  주요 타입: `CommonBanner`, `GuaranteeBanner`, `LinkCategory`, `LinkItem`, `BannerType`, `BannerFormState`, `CategoryFormState`
- **`src/util/shuffle.ts`** — 제네릭 Fisher-Yates shuffle 유틸

### 컴포넌트 분리 원칙

**별도 `*Client.tsx` 래퍼 파일로 페이지 전체를 감싸지 않는다.** 인터랙션이 필요한 목록 페이지는 `page.tsx`에 `"use client"`를 선언하고 `fetch`로 데이터를 가져온다. 서버 컴포넌트가 필요한 경우(상세 페이지 등)에만 서버 컴포넌트 page + 클라이언트 컴포넌트 조합을 사용한다.

### 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_URL          # Storage URL 구성에 사용
JWT_SECRET
```
