# 프로필 기능 구현 Task

## 목표
- users 테이블에 `image_path` 컬럼 추가
- 프로필 수정 페이지 (`/profile`) 구현
- 헤더에 프로필 사진 표시 (DB 조회 없이 JWT 쿠키에서 읽음)

---

## Task 목록

### ~~Task 1. DB 스키마 준비~~ ✅ 완료
- Supabase `users` 테이블 `image_path text` 컬럼 추가 완료
- Storage 버킷: 기존 `public-media` 버킷 사용 (신규 버킷 생성 없음)
- 파일은 버킷 내 폴더로 구분 (예: `avatars/{userId}/profile.webp`)

---

### Task 2. `JwtPayload` 확장 — `src/lib/auth.ts`
- `nickname: string` 필드 추가
- `imagePath: string | null` 필드 추가

```ts
export interface JwtPayload {
  userId: number;
  role: "admin" | "member";
  nickname: string;
  imagePath: string | null;
}
```

---

### Task 3. 로그인 API 수정 — `src/app/api/auth/login/route.ts`
- DB select에 `nickname`, `image_path` 추가
- `signJwt()` 호출 시 `nickname`, `imagePath` 포함

```ts
.select("id, password_hash, role, is_active, nickname, image_path")

signJwt({ userId, role, nickname: user.nickname, imagePath: user.image_path ?? null })
```

---

### Task 4. `Header.tsx` 수정 — `src/components/Header.tsx`
- Supabase DB 조회 제거 (현재 nickname을 DB에서 읽는 코드 삭제)
- `session.nickname`, `session.imagePath`를 직접 사용
- `HeaderNav`, `HamburgerMenu`에 `imagePath` prop 추가 전달

---

### Task 5. `HeaderNav.tsx` / `HamburgerMenu.tsx` 수정
- `imagePath` prop 추가
- 닉네임 왼쪽에 프로필 사진 표시
  - 이미지 있음: Supabase Storage URL 조립 후 `<Image>` 표시
  - 이미지 없음: 기본 아이콘(placeholder) 표시
- 프로필 사진 클릭 시 `/profile`로 이동

---

### Task 6. 프로필 페이지 구현 — `src/app/profile/page.tsx`
- 로그인 상태 확인 (미로그인 시 `/login` redirect)
- DB에서 현재 유저 정보 조회 (`username`, `nickname`, `image_path`)
- UI 구성:
  - 프로필 사진 영역 (등록 / 수정 / 삭제)
  - 아이디 표시 (수정 불가)
  - 닉네임 수정 입력란
  - 저장 버튼

---

### Task 7. 프로필 수정 API — `src/app/api/profile/update/route.ts`
- 인증된 사용자만 접근 가능
- 처리 흐름:
  1. 이미지가 있으면 `public-media` 버킷의 `avatars/{userId}/` 폴더에 업로드
  2. 기존 이미지 삭제 (교체 시, 동일 경로 upsert 또는 기존 파일 remove)
  3. `users` 테이블 업데이트 (`nickname`, `image_path`)
     - `image_path` 값 예시: `avatars/{userId}/profile.webp`
  4. 변경된 정보로 JWT 재발급 → 쿠키 갱신

---

### Task 8. 프로필 이미지 삭제 API — `src/app/api/profile/delete-image/route.ts`
- `public-media` 버킷의 `avatars/{userId}/` 경로에서 파일 삭제
- DB의 `image_path`를 `null`로 업데이트
- JWT 재발급 (`imagePath: null`) → 쿠키 갱신

---

## 구현 순서

```
Task 1 ✅ → Task 2 ✅ → Task 3 ✅ → Task 4 ✅ → Task 5 ✅ → Task 6 ✅ → Task 7 ✅ → Task 8 ✅
```

모든 Task 완료.
