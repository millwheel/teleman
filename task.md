# 불필요한 서버 사이드 fetch 제거 — 클라이언트 컴포넌트 전환

## 배경

현재 대부분의 페이지가 서버 컴포넌트로 구성되어 있어, 내부 API 호출 시마다 아래 보일러플레이트가 반복된다.

```ts
const headersList = await headers();
const host = headersList.get("host")!;
const proto = process.env.NODE_ENV === "production" ? "https" : "http";
const res = await fetch(`${proto}://${host}/api/...`);
```

분석 결과, **실제로 SSR이 필요한 페이지는 2개뿐**이고 나머지는 관성적으로 동일 패턴을 따르고 있었다.

---

## 대상 분류

### SSR 유지 (변경 없음)

| 페이지 | 이유 |
|--------|------|
| `(main)/profile/page.tsx` | 인증 실패 시 서버에서 redirect 필요 |
| `(main)/links/[code]/page.tsx` | 잘못된 카테고리 코드에 대해 `notFound()` 404 처리 |

### 클라이언트 전환 대상

| # | 페이지 | 현재 서버 fetch | 비고 |
|---|--------|-----------------|------|
| 1 | `(main)/scammer/page.tsx` | `/api/scammer/stats` + `getSession()` | 공개 데이터 + 로그인 여부만 확인 |
| 2 | `(main)/guarantee/page.tsx` | `/api/banners/guarantee` | 공개 데이터, 인증 불필요 |
| 3 | `(main)/links/page.tsx` | `/api/banners/links` | 공개 데이터, 인증 불필요 |
| 4 | `admin/ad/page.tsx` | `/api/admin/ads` → `initialBanners` prop | 안티패턴: layout이 이미 인증 처리 |
| 5 | `admin/guarantee/page.tsx` | `/api/admin/guarantees` → `initialBanners` prop | 안티패턴: layout이 이미 인증 처리 |

---

## 작업 계획

### 1단계: admin 페이지 전환 (안티패턴 제거 + 컴포넌트 인라인화)

서버 fetch → prop 전달 → 별도 클라이언트 컴포넌트 구조를, **page.tsx 하나로 통합**한다.
현재 `AdManager`, `GuaranteeManager`는 page.tsx에서만 사용되므로 별도 파일로 분리할 이유가 없다.

#### 1-1. `admin/ad/page.tsx` + `AdManager.tsx` 통합

**Before:**
```
admin/ad/page.tsx (서버) → fetch → initialBanners prop → AdManager.tsx (클라이언트)
```

**After:**
```
admin/ad/page.tsx (클라이언트) — AdManager의 로직을 page.tsx에 직접 작성
```

- page.tsx에 `"use client"` 추가
- AdManager.tsx의 state, fetch, 모달 로직을 page.tsx로 이동
- `initialBanners` prop 제거, `useEffect`에서 `fetch('/api/admin/ads')` 호출
- 이미 내부에 refetch 로직이 있으므로 해당 함수를 초기 로드에도 재활용
- `components/admin/AdManager.tsx` 파일 삭제

#### 1-2. `admin/guarantee/page.tsx` + `GuaranteeManager.tsx` 통합

동일한 패턴으로 변경.

- page.tsx에 `"use client"` 추가
- GuaranteeManager.tsx의 state, fetch, 모달 로직을 page.tsx로 이동
- `initialBanners` prop 제거, `useEffect`에서 `fetch('/api/admin/guarantees')` 호출
- `components/admin/GuaranteeManager.tsx` 파일 삭제

---

### 2단계: 공개 데이터 메인 페이지 전환

#### 2-1. `(main)/guarantee/page.tsx`

- `"use client"` 추가
- `useEffect`에서 `fetch('/api/banners/guarantee')` 호출
- `useState`로 배너 목록 관리
- `shuffle`은 클라이언트에서 수행

#### 2-2. `(main)/scammer/page.tsx`

- `"use client"` 추가
- `useEffect`에서 `fetch('/api/scammer/stats')` 호출하여 통계 로드
- `getSession()` 대신 `fetch('/api/me')`로 로그인 여부 확인
- `useState`로 stats, isLoggedIn 관리

#### 2-3. `(main)/links/page.tsx` — 서버/클라이언트 하이브리드 + API 분리

현재 `/api/banners/links`가 ad, link, categories를 하나의 응답으로 반환하고 있다.
ad와 link는 별개의 리소스이므로 API를 분리하고, 페이지도 서버/클라이언트 영역을 나눈다.

##### API 분리

| 현재 | 변경 후 | 반환 데이터 |
|------|---------|-------------|
| `GET /api/banners/links` (ad+link+categories 혼합) | `GET /api/ads` | `{ longBanners, shortBanners }` |
| | `GET /api/links` | `LinkItem[]` (likes 내림차순) |
| | categories는 API 불필요 | `LINK_CATEGORIES` 상수를 직접 import |

- 기존 `/api/banners/links` route는 위 두 API로 분리 후 삭제
- categories는 현재도 `LINK_CATEGORIES` 상수를 그대로 반환하고 있으므로 API를 거칠 필요 없음

##### 페이지 구조: 서버 + 클라이언트 분리

```
LinksPage (서버 컴포넌트)
├── <AdBannerSection />        ← "use client", fetch('/api/ads') 후 shuffle
├── 카테고리 + Top10 목록       ← 서버에서 LINK_CATEGORIES import + fetch('/api/links')로 렌더 (SEO)
└── 정적 배너 이미지            ← 서버에서 렌더
```

- **서버 영역**: `LINK_CATEGORIES`를 직접 import, `/api/links`로 링크 목록 fetch → 카테고리별 Top10을 서버에서 렌더 (SEO 확보)
- **클라이언트 영역**: 광고 배너를 별도 클라이언트 컴포넌트 `AdBannerSection`으로 분리, `fetch('/api/ads')` 후 shuffle하여 렌더
- 기존 `AdBannerGrid` 컴포넌트는 그대로 활용 가능

---

### 3단계: 정리

- 삭제 대상 파일 확인: `AdManager.tsx`, `GuaranteeManager.tsx`가 다른 곳에서 import되지 않는지 검증 후 삭제
- 모든 페이지에서 `headers()` import 및 절대 URL 조립 코드가 제거되었는지 확인
- `npm run build` 로 빌드 정상 확인
- `npm run lint` 로 린트 통과 확인

---

## 주의사항

- **로딩 상태 처리**: 클라이언트 전환 시 데이터 fetch 전까지 로딩 UI(스켈레톤 또는 스피너)가 필요할 수 있음
- **SEO 영향**: 공개 페이지(guarantee, links, scammer)는 초기 HTML에 데이터가 포함되지 않게 됨. SEO가 중요한 페이지가 있다면 해당 페이지는 SSR 유지를 고려
- **admin 페이지는 SEO 무관**하므로 전환에 부작용 없음
