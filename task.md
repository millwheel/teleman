# 사기꾼 조회 기능 구현 Task

> 참고 문서: `reference/scammer.md`

---

## Task 1. 공통 컴포넌트 — 사기꾼 검색 바

**파일 위치 예시:** `src/components/ScammerSearchBar.tsx`

- [x] 검색 바 UI 구현 (`reference/scammer-search-bar.png` 참고)
  - 왼쪽: 검색 타입 드롭다운 (이름 / 전화번호 / 계좌번호)
  - 오른쪽: 텍스트 입력 + 검색 버튼(돋보기)
- [x] 검색 최소 길이 유효성 검사
  - 이름: 2자 이상
  - 전화번호 / 계좌번호: 4자 이상
- [x] 검색 실행 시 로그인 여부 확인
  - 미로그인: `'로그인이 필요한 기능입니다.'` alert → `/login` 리다이렉션
  - 로그인 후 원래 페이지로 복귀
- [x] 검색 실행 시 `/scammer/result?type=<타입>&q=<검색어>&page=1` 로 이동

---

## Task 2. 공통 컴포넌트 — 페이지네이션 바

**파일 위치 예시:** `src/components/Pagination.tsx`

- [x] 번호형 페이지네이션 UI 구현
- [x] props: `totalCount`, `currentPage`, `pageSize`, `onPageChange`
- [x] 현재 페이지 하이라이트
- [x] 이전 / 다음 버튼 및 첫 페이지 / 마지막 페이지 버튼 포함

---

## Task 3. 사기꾼 조회 메인 페이지 `/scammer`

**파일 위치 예시:** `src/app/scammer/page.tsx`

- [x] 상단 Hero 섹션 (`reference/scammer-search-bar.png` 참고)
  - 제목: "사기꾼 조회"
  - 부제목 문구
  - 사기꾼 검색 바 컴포넌트 배치
- [x] 하단 소개 섹션 (`reference/scammer-page-bottom.png` 참고)
  - 4개 항목: 실시간 빅데이터 검증 시스템 / 히스토리 리포트&위험도 필터링 / 전문팀의 직접 모니터링 / 최대 1억원 보증금 예치제도
  - 각 항목에 아이콘, 제목, 설명 텍스트 배치

---

## Task 4. 사기꾼 검색 결과 페이지 `/scammer/result`

**파일 위치 예시:** `src/app/scammer/result/page.tsx`

- [x] 상단: 사기꾼 검색 바 컴포넌트 (현재 검색어 / 타입 유지)
- [x] 검색 결과 목록 테이블
  - 컬럼 순서: 이름 / 전화번호 / 계좌번호 / 설명(description)
  - 정렬: `order by id desc`
- [x] 목록 하단: 페이지네이션 바 컴포넌트

---

## Task 5. 사기꾼 검색 API

**파일 위치 예시:** `src/app/api/scammer/search/route.ts`

- [x] Query params: `type` (`name` | `phone` | `account`), `q`, `page`, `limit`
- [x] 타입별 쿼리 분기 (LIKE 검색)
  - `name`: `name like '%' || :q || '%'`
  - `phone`: `phone_number like '%' || :q || '%'`
  - `account`: `bank_account_number like '%' || :q || '%'`
- [x] total count와 page items 동시 반환
- [x] `page=1` 일 때만 `scammer_search` 카운트 +1 (upsert)
  ```sql
  insert into public.scammer_search (stat_date, count)
  values ((now() at time zone 'Asia/Seoul')::date, 1)
  on conflict (stat_date)
  do update set count = public.scammer_search.count + 1;
  ```
- [x] 미로그인 요청 시 401 반환

---

## Task 6. 사기꾼 관리 페이지 `/admin/scammer`

**파일 위치 예시:** `src/app/admin/scammer/page.tsx`

- [x] 사기꾼 목록 테이블 (이름 / 전화번호 / 계좌번호 / 설명)
  - 각 행 오른쪽: 수정 버튼 / 삭제 버튼
- [x] 목록 우측 상단: 추가 버튼
- [x] 추가 / 수정 클릭 시 모달 열림

---

## Task 7. 사기꾼 등록/수정/삭제 API

**파일 위치 예시:** `src/app/api/admin/scammer/route.ts`

- [x] 모든 엔드포인트: `admin` role 검증, 아닌 경우 403 반환
- [x] **등록 (POST)**
  - 이름 / 전화번호 / 계좌번호 중 최소 하나 필수
  - 전화번호, 계좌번호 저장 전 하이픈(`-`) 제거
  - `created_by`: 로그인한 사용자 id
- [x] **수정 (PATCH / PUT)**
  - 이름 / 전화번호 / 계좌번호 중 최소 하나 필수
  - 전화번호, 계좌번호 저장 전 하이픈 제거
- [x] **삭제 (DELETE)**
  - id 기반 즉시 삭제

---

## Task 8. 관리 모달 컴포넌트

**파일 위치 예시:** `src/components/ScammerFormModal.tsx`

- [x] 모드: 추가 / 수정 공통 컴포넌트
- [x] 입력 필드: 이름, 전화번호, 계좌번호, 설명
- [x] 유효성 검사: 이름 / 전화번호 / 계좌번호 중 최소 하나 입력
- [x] 저장 성공 시 목록 갱신 후 모달 닫기

---

## 구현 순서 권장

```
Task 2 (페이지네이션) → Task 1 (검색 바)
    ↓
Task 5 (검색 API) → Task 4 (결과 페이지)
    ↓
Task 3 (메인 페이지)
    ↓
Task 7 (관리 API) → Task 8 (모달) → Task 6 (관리 페이지)
```
