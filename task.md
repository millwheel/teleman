# Task: Link 상세 페이지 도입

## 배경

현재 `LinkCategoryCard`(카테고리 목록 페이지)와 `LinkCard`(카테고리 상세 페이지)에서 항목을 클릭하면 `link.link`(외부 URL)로 바로 이동한다. 이를 내부 상세 페이지로 변경한다.

## 현재 동작

| 위치 | 파일 | 클릭 시 동작 |
|------|------|-------------|
| `/link` 카테고리 목록 | `src/components/LinkCategoryCard.tsx` | 각 항목 `<a href={item.link} target="_blank">` → 외부 URL 직접 이동 |
| `/link/[code]` 카테고리 상세 | `src/components/LinkCard.tsx` | 카드 전체 `<a href={link.link} target="_blank">` → 외부 URL 직접 이동 |

## 목표 동작

클릭 시 `/link/[code]/[id]` 상세 페이지로 이동.

---

## 작업 목록

### 1. `LinkItem` 타입에 `created_at` 추가

**파일:** `src/data/type.ts`

- `LinkItem` 타입에 `created_at: string;` 필드 추가
- DB `link` 테이블에 Supabase 기본 `created_at` 컬럼이 존재하므로, `select("*")` 시 이미 반환됨

### 2. API 엔드포인트 생성: `GET /api/links/item/[id]`

**파일:** `src/app/api/links/item/[id]/route.ts` (신규)

- `link` 테이블에서 `id`로 단건 조회
- `image_path`가 있으면 `getPublicImageUrl`로 `public_url` 생성
- 404 처리 포함
- 참고: 경로를 `/api/links/[id]`로 하면 기존 `/api/links/[code]`와 동적 세그먼트 충돌하므로 `/api/links/item/[id]` 사용

### 3. 상세 페이지 생성: `/link/[code]/[id]`

**파일:** `src/app/(main)/link/[code]/[id]/page.tsx` (신규)

- `"use client"` 클라이언트 컴포넌트 (커뮤니티 상세 페이지 패턴 참고: `src/app/(main)/community/[category]/[id]/page.tsx`)
- `useParams`로 `code`, `id` 추출
- `/api/links/item/[id]`에서 데이터 fetch

**레이아웃 (`reference/link-detail.md` 기준):**

- 배경: `bg-background`
- **상단 헤더**
  - 1 layer: 제목 (링크 이름)
  - 2 layer: 좌측에 이미지 + 링크 전체 URL 표시(클릭 시 외부 이동), 우측에 좋아요(♥) + 작성일(`created_at`)
- 회색 구분선
- **중단 본문**: `description` 표시
- 회색 구분선
- **하단**: "목록으로" 버튼 → `/link/[code]`로 이동
- `LinkCategoryTabs` 포함
- `AdBannerSection` 포함

### 4. `LinkCard` 수정

**파일:** `src/components/LinkCard.tsx`

- props에 `categoryCode: string` 추가
- `<a href={link.link} target="_blank">` → `<Link href={/link/${categoryCode}/${link.id}}>` 변경
- `next/link`의 `Link` 사용

### 5. `LinkCategoryCard` 수정

**파일:** `src/components/LinkCategoryCard.tsx`

- 각 항목의 `<a href={item.link} target="_blank">` → `<Link href={/link/${category.code}/${item.id}}>` 변경

### 6. `LinkCard` 호출부 수정

**파일:** `src/app/(main)/link/[code]/page.tsx`

- `LinkCard`에 `categoryCode={code}` prop 전달

---

## 영향 범위

| 파일 | 변경 유형 |
|------|----------|
| `src/data/type.ts` | 수정 (`LinkItem`에 `created_at` 추가) |
| `src/app/api/links/item/[id]/route.ts` | 신규 |
| `src/app/(main)/link/[code]/[id]/page.tsx` | 신규 |
| `src/components/LinkCard.tsx` | 수정 |
| `src/components/LinkCategoryCard.tsx` | 수정 |
| `src/app/(main)/link/[code]/page.tsx` | 수정 (prop 추가) |
