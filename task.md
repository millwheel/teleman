# TextBanner 관리 페이지 — query param → path variable 리팩토링

## 목표

`/admin/text-banner?categoryId=X` (query param) 방식을
`/admin/text-banner/[categoryId]` (path variable) 방식으로 변경.

- `useSearchParams()` 제거 → `Suspense` 불필요
- 개요 페이지 / 상세 페이지를 파일 시스템 라우팅으로 명확히 분리

---

## 현재 구조

```
/admin/text-banner?categoryId=X   ← 하나의 파일이 두 모드를 처리
```

```
src/app/admin/text-banner/
  page.tsx                        ← overview + detail 모드가 if문으로 혼재
                                     useSearchParams() → Suspense 필요
```

---

## 변경 후 구조

```
/admin/text-banner                ← 개요 전용
/admin/text-banner/[categoryId]   ← 상세 전용 (path variable)
```

```
src/app/admin/text-banner/
  page.tsx                        ← 개요 모드만, useSearchParams 없음, Suspense 제거
  [categoryId]/
    page.tsx                      ← 상세 모드만, params.categoryId 사용, Suspense 없음
```

---

## 작업 목록

### 1. `page.tsx` — 개요 전용으로 정리

- `useSearchParams`, `useRouter` import 제거
- `Suspense` import 및 wrapper 제거
- `TextBannerContent` 컴포넌트를 분리 없이 페이지에 직접 작성
- detail 모드 코드 (`if (categoryId)` 분기 이하) 전부 제거
- 카테고리 링크 변경:
  ```diff
  - href={`/admin/text-banner?categoryId=${cat.id}`}
  + href={`/admin/text-banner/${cat.id}`}
  ```
- API 호출: 개요는 전체 배너를 가져오는 로직 유지

### 2. `[categoryId]/page.tsx` — 신규 생성

- Next.js App Router의 `params` 사용:
  ```ts
  export default function TextBannerDetailPage({
    params,
  }: {
    params: { categoryId: string };
  }) {
    const categoryId = Number(params.categoryId);
    ...
  }
  ```
- `useSearchParams()` 없음 → `Suspense` 불필요
- 현재 `TextBannerContent`의 detail 모드 코드를 이관
- 뒤로가기 링크: `/admin/text-banner` (고정값, 동적 파라미터 불필요)

### 3. API 변경 없음

기존 API 경로는 query param을 사용하지 않고 path variable을 쓰는 구조이므로 수정 불필요:
- `GET /api/admin/text-banners?categoryId=X` — 개요 fetch에 그대로 사용
- `GET /api/admin/text-banners?categoryId=X` — 상세 fetch에도 그대로 사용 (categoryId는 params에서 읽으면 됨)

---

## 변경 전/후 비교

| 항목 | Before | After |
|------|--------|-------|
| 상세 URL | `/admin/text-banner?categoryId=3` | `/admin/text-banner/3` |
| categoryId 읽는 방법 | `useSearchParams().get("categoryId")` | `params.categoryId` |
| Suspense 필요 여부 | 필요 | 불필요 |
| 파일 수 | 1개 (개요+상세 혼재) | 2개 (개요 / 상세 분리) |
| 코드 복잡도 | if문 분기로 두 모드 혼재 | 각 파일이 단일 책임 |
