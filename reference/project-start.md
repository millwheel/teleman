# 텔레맨 웹사이트 기능 명세서 (Prompt용 최종 버전)

본 문서는 텔레맨 웹사이트를 구현하기 위한 최종 기능 명세서이다.

Next.js App Router 기반으로 구현하며, Supabase(Postgres + Storage)를 사용한다.

---

# 1. 기술 스택

- Framework: Next.js (App Router)
- UI: shadcn/ui + TailwindCSS
- Icons: lucide-react
- Database: Supabase (Postgres)
- Storage: Supabase Storage (bucket: `public-media`)
- Authentication: httpOnly Cookie + JWT (jose 라이브러리)
- Password Hashing: bcrypt
- 데이터 랜덤 처리: SQL `order by random()`

---

# 2. 테마 설계

## globals.css

```
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

## 사용 규칙

- primary: 주요 액션 버튼
- primary-light: hover 상태
- secondary: 카드/목록 프레임
- eliminate: 삭제/위험 액션
- eliminate-light: 삭제 hover
- active: 메뉴 활성 상태

배경 색상은 다음을 유지한다:

```
:root {
--background: #ffffff;
--foreground: #171717;
}
```

---

# 3. 인증 설계

## 인증 방식

- httpOnly Cookie + JWT
- jose 라이브러리 사용
- 구현 위치: `src/lib/auth.ts`

## JWT Payload

```
{
userId:number;
role:'admin'|'member';
}
```

## 로그인 절차

1. username으로 users 조회
2. bcrypt.compare(password, password_hash)
3. is_active = true 인지 확인
4. JWT 발급
5. httpOnly cookie (`teleman_session`) 설정

## 로그인 제한

- is_active = false 사용자는 로그인 불가

## 로그아웃

- teleman_session cookie 삭제

---

# 4. 관리자 시스템

## 관리자 접근 제어

- `/admin` 이하 모든 경로는 ADMIN role만 접근 가능
- 구현 위치: `app/admin/layout.tsx`
- JWT 검증 후 role !== 'admin' 이면 `/`로 redirect

## 관리자 초대

- 관리자는 다른 관리자를 초대할 수 있다
- 초대된 사용자는 role = 'admin' 으로 생성
- 일반 회원은 관리자 생성 불가

---

# 5. 사용자(users)

## 주요 규칙

- username: unique
- password_hash: bcrypt 저장
- role: 'admin' | 'member'
- is_active: false이면 로그인 불가
- created_by가 null인 경우:
    - "탈퇴한 사용자" 또는 "사용자 정보 없음"으로 표시

---

# 6. 메인 페이지

- `/` → `/link`로 redirect

---

# 7. 공통 헤더

## 2 Layer 구조

### 상단

- 좌측: 로고
- 우측: 텔레그램 링크 버튼

### 하단 메뉴

- 링크모음
- 보증업체
- 사기꾼조회
- 커뮤니티
- 공지사항
- 로그인
- 회원가입

active 상태는 `--active` 색상 사용

---

# 8. 로그인 페이지

- 중앙 정렬 폼
- username
- password
- 로그인 버튼
- 로그인 실패 시 에러 표시

---

# 9. 회원가입 페이지

- username
- nickname (name)
- password
- 가입하기 버튼
- username 중복 실시간 체크
- is_active는 기본 true

---

# 10. 링크모음 페이지 (/link)

## 상단

- static Image 영역

## 공통 배너 (2x2)

- 테이블: common_banner
- `order by random()`
- 4개만 조회
- 2x2 고정 배치

## 텍스트 배너

- 카테고리 4열 grid
- 정렬: sort_order asc

### 카테고리 내 배너

- 정렬: sort_order asc
- 최대 10개 표시
- 각 카테고리별 배너 개수: 0~10개

## 하단

- static Image 영역

---

# 11. 보증업체 페이지 (/guarantee)

- 테이블: image_banner
- `order by random()`
- 4열 grid
- 개수 제한 없음 (0~N)
- 하단 static Image 영역

---

# 12. 관리자 메인 (/admin)

1열 버튼:

- 링크모음 관리
- 보증업체 관리
- 광고배너 관리

---

# 13. 링크모음 관리 (/admin/text-banner)

- text_banner_categories 4열 grid
- 정렬: sort_order asc

각 카드:

- 상단: 카테고리명 + 톱니바퀴 버튼
- 하단: 해당 카테고리 text_banners 목록

우측 상단:

- 카테고리 관리 버튼

---

# 14. 링크모음 세부 관리 (/admin/text-banner?categoryId={id})

## 상단

- 카테고리명 표시

## 하단

- 해당 카테고리 text_banners 1열 목록
- 정렬: sort_order asc

각 항목:

- name
- 위로 버튼
- 아래로 버튼
- 수정
- 삭제

## 정렬 정책

- sort_order는 항상 0부터 연속 유지
- swap 방식 사용
- 동일 category 내 sort_order 중복 불가
- DB 레벨 unique 제약 권장

## 추가

- name, link 입력 모달
- sort_order는 현재 개수 기반 자동 부여

## 삭제

- DB에서 hard delete

---

# 15. 링크 카테고리 관리 (/admin/text-banner-categories)

1열 목록

각 항목:

- code
- name
- 위로
- 아래로
- 수정
- 삭제

## code 입력 규칙

- 영문 소문자 + 숫자만 허용
- 프론트에서 정규식으로 검증

```
^[a-z0-9]+$
```

## 삭제

- 경고 AlertDialog 표시
- "하위에 링크모음이 모두 삭제됩니다. 정말로 삭제합니까?"
- DB cascade 동작

---

# 16. 보증업체 관리 (/admin/image-banner)

- 4열 카드
- 0~N개 허용

각 카드:

- image
- name
- 수정
- 삭제

## 추가 모달

입력:

- name
- link
- image 파일

업로드 흐름:

1. 파일 선택
2. uuid 생성
3. 경로:

    ```
    image-banners/{uuid}.{ext}
    ```

4. Supabase storage 업로드
5. DB에 image_path 저장

## 수정

- name, link 변경 가능
- image 변경 불가

## 삭제

- DB row 삭제

---

# 17. 광고 배너 관리 (/admin/common-banner)

구조 동일

- 테이블: common_banner
- 0~N개 허용

업로드 경로:

```
common-banners/{uuid}.{ext}
```

image 변경 불가

---

# 18. Storage 설계

- bucket: public-media
- DB에는 image_url이 아니라 image_path 저장

Public URL 생성:

```
supabase.storage
.from('public-media')
.getPublicUrl(image_path)
```

---

# 19. created_by 처리 정책

- 모든 테이블에서 created_by가 null이면:
    - "탈퇴한 사용자" 또는 "사용자 정보 없음"으로 표시

---

# 20. 데이터 정렬 규칙 요약

| 영역 | 정렬 |
| --- | --- |
| 카테고리 | sort_order asc |
| text_banner | sort_order asc |
| common_banner | random |
| image_banner | random |

---

# 21. 보장 규칙 요약

- 관리자만 /admin 접근 가능
- 관리자는 관리자 초대 가능
- is_active=false 사용자는 로그인 불가
- link_categories.code는 소문자 영문 + 숫자만 허용
- text_banners는 카테고리별 0~10개
- image_banner는 0~N개
- created_by가 null이면 탈퇴 사용자 표시

---

이 문서를 기준으로 구현을 진행한다.