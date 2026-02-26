# 공통 배너 타입 분리 작업 (long / short)

## 배경
- `common_banner` 테이블에 `type` 컬럼 추가 (값: `'long'` | `'short'`)
- **height는 두 타입 모두 동일(104px)**, 열 수를 다르게 하여 비율 차이를 구현
  - 긴 배너: 1행 2열 → 열 너비 ~622px → 6:1 비율 자연스럽게 구현
  - 짧은 배너: 1행 4열 → 열 너비 ~309px → 3:1 비율 자연스럽게 구현
- 관리자 페이지와 사용자 링크 페이지 모두 반영

---
ㅅㄷ
## 작업 목록

### 1. DB 마이그레이션
- [x] `common_banner` 테이블에 `type text not null default 'long'` 컬럼 추가
  - 허용 값: `'long'`, `'short'`
  - 기존 데이터는 `'long'`으로 일괄 설정
- 이미 개발자가 미리 다 처리했으므로 신경쓰지 말 것
---

### 2. 타입 정의
**파일:** `src/types/` 또는 해당 파일 상단

- [ ] `BannerType` enum(또는 union type) 정의
  ```ts
  export type BannerType = 'long' | 'short';
  ```
- [ ] `CommonBanner` 타입에 `type: BannerType` 필드 추가
  - 영향 범위:
    - `src/app/admin/common-banner/page.tsx`
    - `src/app/api/admin/common-banners/route.ts`
    - `src/app/api/admin/common-banners/[id]/route.ts`
    - `src/app/api/banners/links/route.ts`
    - `src/app/(main)/links/page.tsx`

---

### 3. Admin API 수정
**파일:** `src/app/api/admin/common-banners/route.ts`

- [ ] **GET**: 응답에 `type` 필드 포함
- [ ] **POST**: FormData에서 `type` 값 수신 → DB insert 시 포함
  - 유효성 검사: `'long'` 또는 `'short'`만 허용

**파일:** `src/app/api/admin/common-banners/[id]/route.ts`

- [ ] **PUT**: `type` 필드 수정 가능하도록 업데이트

---

### 4. AddBannerModal 수정
**파일:** `src/components/admin/AddBannerModal.tsx`

- [ ] `type` 선택 UI 추가 (라디오 버튼 또는 select)
  - 선택지: 긴 배너 (6:1) / 짧은 배너 (3:1)
- [ ] FormData에 `type` 값 포함하여 POST 요청

---

### 5. 관리자 페이지 수정
**파일:** `src/app/admin/common-banner/page.tsx`

- [ ] 배너 목록을 `type`으로 분리
  ```
  longBanners  = banners.filter(b => b.type === 'long')
  shortBanners = banners.filter(b => b.type === 'short')
  ```
- [ ] 섹션 1: **긴 배너 관리** (상단)
  - 테이블 헤더에 비율 안내 (6:1, 권장: 1260×210px)
  - 이미지 미리보기 height: 104px
  - 배너 추가 버튼 → type='long'으로 AddBannerModal 호출
- [ ] 섹션 2: **짧은 배너 관리** (하단)
  - 테이블 헤더에 비율 안내 (3:1, 권장: 630×210px)
  - 이미지 미리보기 height: 104px (long과 동일)
  - 배너 추가 버튼 → type='short'으로 AddBannerModal 호출

---

### 6. 공개 API 수정
**파일:** `src/app/api/banners/links/route.ts`

- [ ] `common_banner` 조회 결과에 `type` 필드 포함
- [ ] 응답 구조 변경: `commonBanners` 단일 배열 → 타입별로 분리
  ```ts
  {
    longBanners: CommonBanner[],   // type === 'long'
    shortBanners: CommonBanner[],  // type === 'short'
    categories: Category[],
    textBanners: TextBanner[]
  }
  ```

---

### 7. 링크 페이지 수정
**파일:** `src/app/(main)/links/page.tsx`

- [ ] API 응답에서 `longBanners`, `shortBanners` 각각 수신
- [ ] 섹션 1: **긴 배너** (6:1, height: 104px)
  - `grid-cols-1 sm:grid-cols-2` (데스크톱 2열, 모바일 1열)
  - 전체 배너 표시, shuffle 적용
- [ ] 섹션 2: **짧은 배너** (3:1, height: 104px)
  - `grid-cols-2 md:grid-cols-4` (데스크톱 4열, 모바일 2열)
  - 전체 배너 표시, shuffle 적용
- [ ] `CommonBanner` 로컬 타입에 `type: BannerType` 추가

---

## 작업 순서 (권장)

```
1 (DB) → 2 (타입) → 3 (API) → 4 (모달) → 5 (관리자 페이지) → 6 (공개 API) → 7 (링크 페이지)
```

---

## 참고: 배너 레이아웃 기준

| 타입 | 비율 | 열 수 (데스크톱) | 열 수 (모바일) | 열 너비 | height |
|------|------|-----------------|---------------|---------|--------|
| long | 6:1 | 2열 | 1열 | ~622px | 104px |
| short | 3:1 | 4열 | 2열 | ~309px | 104px |

> height를 104px로 고정하면 열 너비 차이로 인해 각 타입의 비율이 자연스럽게 구현됨
