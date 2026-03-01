# Admin 회원관리 페이지 추가 계획

## Context
관리자 페이지에 일반 회원 목록을 조회하고 탈퇴 처리할 수 있는 페이지가 필요. 기존 `/admin/members`는 관리자 관리 페이지이므로, 일반 회원 관리는 `/admin/users`로 추가. `/admin/members`는 `/admin/managers` 로 변경

## 변경 파일

### 1. `src/components/AdminHeaderNav.tsx` — 네비 메뉴 추가
- `ADMIN_NAV` 배열에 `{ label: "회원 관리", href: "/admin/users" }` 추가

### 2. `src/app/admin/page.tsx` — 메인 메뉴 추가
- MENU 배열에 회원 관리 항목 추가

### 3. `src/app/api/admin/users/route.ts` — API (GET 목록)
- `getSession()` + role 체크
- `supabase.from("users").select("id, username, nickname, role, is_active, created_at")`
- 페이지네이션 (PAGE_SIZE=20)
- 응답: `{ items, totalCount }`

### 4. `src/app/api/admin/users/[id]/route.ts` — API (PATCH 비활성화 / DELETE 삭제)
- PATCH: `is_active`를 토글 (비활성화/복구)
- DELETE: DB에서 실제 삭제
- 둘 다 `getSession()` + role 체크

### 5. `src/app/admin/users/page.tsx` — 회원관리 페이지
- 기존 `admin/scammer/page.tsx` 패턴 참고
- 테이블 컬럼: 아이디(username), 닉네임(nickname), 권한(role), 가입일(created_at), 비활성화 버튼, 삭제 버튼
- 비활성화 버튼: confirm → PATCH 호출 → is_active 토글 (비활성화된 회원은 "복구" 버튼)
- 삭제 버튼: confirm → DELETE 호출 → 목록에서 제거
- 페이지네이션

## 검증
- `/admin` 메인에서 회원 관리 메뉴 표시 확인
- `/admin/users`에서 회원 목록 정상 로드 확인
- 탈퇴 처리 후 상태 반영 확인
