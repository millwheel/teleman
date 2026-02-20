# 텔레맨 웹사이트 구현 태스크

## 현황 파악

- 프레임워크: Next.js 16 (App Router) + TailwindCSS 4 기본 세팅 완료
- 미설치 패키지: shadcn/ui, @supabase/supabase-js, jose, bcryptjs, lucide-react
- DB 스키마: ddl.md 기준 (users, text_banner_categories, text_banners, image_banner, common_banner)
- 참고 디자인: link_list_page.png (링크모음), garantee_page.png (보증업체)

---

## Phase 0: 환경 설정

### 0-1. 패키지 설치
- shadcn/ui 초기화 (components.json, cn 유틸)
- @supabase/supabase-js
- jose (JWT 발급/검증)
- bcryptjs + @types/bcryptjs
- lucide-react
- uuid + @types/uuid

### 0-2. 환경 변수 설정
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

### 0-3. globals.css 테마 적용
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #1e40af;
  --primary-light: #2563eb;
  --secondary: #1e3a8a;
  --eliminate: #dc2626;
  --eliminate-light: #ef4444;
  --active: #ef4444;
}
```

### 0-4. 공통 유틸 및 클라이언트 설정
- `src/lib/supabase.ts` — Supabase 서버 클라이언트
- `src/lib/auth.ts` — JWT 발급/검증, cookie 처리 (jose 사용)
- `src/lib/storage.ts` — Supabase 스토리지 위치 getPublicImageUrl

---

## Phase 1: 공통 컴포넌트

### 1-1. Header 컴포넌트 (`src/components/Header.tsx`)
- 2-Layer 구조
  - **상단**: 좌측 로고(텔레맨), 우측 텔레그램 바로가기 버튼
  - **하단 메뉴**: 링크모음 / 보증업체 / 사기꾼조회 / 커뮤니티 / 공지사항 / 로그인 / 회원가입
- 현재 경로 기준 active 메뉴 강조 (`--active` 색상 = #ef4444)
- 로그인 상태에서 로그인/회원가입 → 유저명/로그아웃 전환

### 1-2. 루트 레이아웃 (`src/app/layout.tsx`)
- Header 포함
- TailwindCSS, 테마 변수 적용

### 1-3. 루트 페이지 리다이렉트 (`src/app/page.tsx`)
- `/` → `/links` redirect

---

## Phase 2: 인증

### 2-1. 로그인 페이지 (`src/app/login/page.tsx`)
- 중앙 정렬 폼: username, password, 로그인 버튼
- 실패 시 에러 메시지 표시

### 2-2. 로그인 API (`src/app/api/auth/login/route.ts`)
- username으로 users 조회
- bcrypt.compare(password, password_hash)
- is_active = true 확인
- JWT 발급 → teleman_session httpOnly cookie 설정
- Payload: `{ userId: number, role: 'admin' | 'member' }`

### 2-3. 회원가입 페이지 (`src/app/register/page.tsx`)
- 입력: username, nickname, password
- username 중복 실시간 체크 (debounce)
- nickname 중복 실시간 체크 (debounce)
- 가입하기 버튼

### 2-4. 회원가입 API (`src/app/api/auth/register/route.ts`)
- username unique 검증
- nickname unique 검증
- bcrypt.hash(password)
- users 삽입 (role='member', is_active=true)

### 2-5. 로그아웃 API (`src/app/api/auth/logout/route.ts`)
- teleman_session cookie 삭제

---

## Phase 3: 퍼블릭 페이지

### 3-1. 링크모음 페이지 (`src/app/links/page.tsx`)
레이아웃 (link_list_page.png 참고):

1. **상단 Static 이미지** — 텔레맨 메인 배너 이미지
2. **공통 배너 (2×2 그리드)**
   - 테이블: `common_banner`
   - `ORDER BY random()` 4개 조회
   - 클릭 시 link로 이동
3. **텍스트 배너 섹션**
   - `text_banner_categories` 4열 그리드 (`sort_order ASC`)
   - 각 카테고리 카드:
     - 상단: 카테고리명 (진한 네이비 배경, 흰 텍스트)
     - 하단: `text_banners` 목록 (`sort_order ASC`, 최대 10개)
     - 각 항목: 클릭 시 link로 이동
4. **하단 Static 이미지** — 텔레맨 링크모음 홍보 배너

### 3-2. 보증업체 페이지 (`src/app/guarantee/page.tsx`)
레이아웃 (garantee_page.png 참고):

1. **이미지 배너 그리드**
   - 테이블: `image_banner`
   - `ORDER BY random()` 전체 조회
   - 4열 그리드, 개수 제한 없음
   - 각 카드: 이미지 표시, 클릭 시 link로 이동
2. **하단 Static 이미지** — 텔레맨 보증업체 홍보 배너

---

## Phase 4: 관리자 페이지

### 4-1. 관리자 레이아웃 (`src/app/admin/layout.tsx`)
- JWT 검증 → role !== 'admin' 이면 `/`로 redirect
- 관리자 전용 사이드/상단 네비게이션

### 4-2. 관리자 메인 (`src/app/admin/page.tsx`)
- 1열 버튼 3개:
  - 링크모음 관리 → `/admin/text-banner`
  - 보증업체 관리 → `/admin/image-banner`
  - 광고배너 관리 → `/admin/common-banner`

### 4-3. 링크모음 관리 (`src/app/admin/text-banner/page.tsx`)
- `text_banner_categories` 4열 그리드 (`sort_order ASC`)
- 각 카드:
  - 상단: 카테고리명 + 톱니바퀴 버튼 (세부 관리 이동)
  - 하단: 해당 카테고리 `text_banners` 목록
- 우측 상단: "카테고리 관리" 버튼 → `/admin/text-banner-categories`

### 4-4. 링크모음 세부 관리 (`src/app/admin/text-banner/page.tsx?categoryId={id}`)
- URL query param `categoryId` 기반
- 상단: 카테고리명 표시
- 하단: 해당 카테고리 `text_banners` 1열 목록 (`sort_order ASC`)
- 각 항목: name / 위로 버튼 / 아래로 버튼 / 수정 / 삭제
- 정렬: swap 방식, 0부터 연속 유지
- 추가 모달: name, link 입력 → sort_order 자동 부여 (현재 개수 기반)
- 삭제: hard delete

### 4-5. 카테고리 관리 (`src/app/admin/text-banner-categories/page.tsx`)
- 1열 목록: code / name / 위로 / 아래로 / 수정 / 삭제
- code 입력 규칙: `^[a-z0-9]+$` (프론트 정규식 검증)
- 삭제 시 AlertDialog: "하위에 링크모음이 모두 삭제됩니다. 정말로 삭제합니까?"
- 삭제 시 DB cascade 동작

### 4-6. 보증업체 관리 (`src/app/admin/image-banner/page.tsx`)
- 4열 카드: image / name / 수정 / 삭제
- **추가 모달**: name, link, image 파일
  - 업로드 흐름: uuid 생성 → `image-banners/{uuid}.{ext}` → Supabase Storage 업로드 → DB에 image_url 저장
- **수정**: name, link 변경만 가능 (image 변경 불가)
- **삭제**: DB row 삭제

### 4-7. 광고배너 관리 (`src/app/admin/common-banner/page.tsx`)
- 4-6과 동일 구조
- 테이블: `common_banner`
- 업로드 경로: `common-banners/{uuid}.{ext}`

---

## Phase 5: API Routes

### 5-1. 텍스트 배너 카테고리 API
- `GET /api/admin/text-banner-categories` — 전체 조회
- `POST /api/admin/text-banner-categories` — 생성
- `PUT /api/admin/text-banner-categories/[id]` — 수정
- `DELETE /api/admin/text-banner-categories/[id]` — 삭제 (cascade)
- `PUT /api/admin/text-banner-categories/[id]/reorder` — 순서 swap

### 5-2. 텍스트 배너 API
- `GET /api/admin/text-banners?categoryId={id}` — 카테고리별 조회
- `POST /api/admin/text-banners` — 생성
- `PUT /api/admin/text-banners/[id]` — 수정
- `DELETE /api/admin/text-banners/[id]` — 삭제
- `PUT /api/admin/text-banners/[id]/reorder` — 순서 swap

### 5-3. 이미지 배너 API (image_banner)
- `GET /api/admin/image-banners` — 전체 조회
- `POST /api/admin/image-banners` — 생성 (Storage 업로드 포함)
- `PUT /api/admin/image-banners/[id]` — name, link 수정
- `DELETE /api/admin/image-banners/[id]` — 삭제

### 5-4. 공통 배너 API (common_banner)
- `GET /api/admin/common-banners` — 전체 조회
- `POST /api/admin/common-banners` — 생성 (Storage 업로드 포함)
- `PUT /api/admin/common-banners/[id]` — name, link 수정
- `DELETE /api/admin/common-banners/[id]` — 삭제

---

## Phase 6: 미구현 페이지 Placeholder

아래 페이지는 헤더 메뉴에는 존재하지만 본 스펙에서 상세 구현 내용이 없으므로 빈 페이지(Coming Soon)로 처리:
- `/scammer` — 사기꾼조회
- `/community` — 커뮤니티
- `/notice` — 공지사항

---

## 구현 순서 요약

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4+5 → Phase 6
환경설정   공통컴포넌트  인증      퍼블릭페이지  관리자+API   플레이스홀더
```

---

## 주요 설계 결정 사항

| 항목 | 결정 |
|------|------|
| DB 스키마 | ddl.md 기준 (image_url 컬럼 사용) |
| Storage 공개 URL | `supabase.storage.from('public-media').getPublicUrl(path)` |
| 정렬 | sort_order swap 방식, 0부터 연속 유지 |
| 인증 | httpOnly cookie `teleman_session`, JWT payload: `{userId, role}` |
| created_by null | "탈퇴한 사용자"로 표시 |
| code 검증 | `^[a-z0-9]+$` 프론트 정규식 |
| 텍스트 배너 제한 | 카테고리당 최대 10개 |
