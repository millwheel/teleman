# 커뮤니티 / 공지사항 구현 작업 정의

## 페이지 구조

### 커뮤니티 (별도 URL 방식)

| 카테고리 | 경로 |
|----------|------|
| 자유게시판 | `/community/free` |
| 베팅게시판 | `/community/betting` |
| 후기게시판 | `/community/review` |
| 섹시갤러리 | `/community/gallery` |

각 카테고리별 하위 페이지:
- 목록: `/community/{category}`
- 상세: `/community/{category}/{id}`
- 생성: `/community/{category}/write`
- 수정: `/community/{category}/{id}/edit`

### 공지사항

- 목록: `/notice`
- 상세: `/notice/{id}`
- 생성: `/notice/write`
- 수정: `/notice/{id}/edit`

## 권한

| 대상 | 조회 | 생성 | 수정 | 삭제 |
|------|------|------|------|------|
| 공지사항 글 | 누구나 | admin | admin | admin |
| 커뮤니티 글 | 누구나 | admin, member | 본인 | 본인, admin |
| 댓글 | 누구나 | admin, member | 본인 | 본인, admin |

## DB 설계

### 테이블

커뮤니티와 공지사항을 **별도 테이블**로 분리한다.

**`community`**
- id, category, title, content, author_id, view_count, created_at, updated_at

**`notice`**
- id, title, content, author_id, view_count, created_at, updated_at

**`community_comment`**
- id, post_id (FK → community), author_id, content, created_at, updated_at

**`notice_comment`**
- id, post_id (FK → notice), author_id, content, created_at, updated_at

### 카테고리 관리

커뮤니티 카테고리 4개는 `link_category`와 동일하게 **코드 상수**로 관리한다.
- 파일: `src/data/communityCategories.ts`

```ts
export const COMMUNITY_CATEGORIES = [
  { key: "free", label: "자유게시판" },
  { key: "betting", label: "베팅게시판" },
  { key: "review", label: "후기게시판" },
  { key: "gallery", label: "섹시갤러리" },
] as const;
```

## UI/UX

### 에디터

- TipTap simple-editor 사용 (`npx @tiptap/cli@latest add simple-editor`)
- Wysiwyg 지원
- 이미지 업로드 지원 (기존 `public-media` 버킷 활용)

### 목록 페이지

- 1 row: 번호, 제목, 작성자(닉네임), 작성날짜, 조회수
- 하단 페이지네이션 바 (20개/페이지)
- 목록 컴포넌트는 커뮤니티/공지사항 공용

### 상세 페이지

- 본문: TipTap 기반 렌더링
- 본문 하단: 댓글 목록 + 댓글 작성

### 댓글

- 표시: 작성자(닉네임), 댓글 본문, 수정/삭제 버튼
- 수정/삭제 버튼은 본인 댓글에만 노출
- 관리자는 모든 댓글에 삭제 버튼 노출

## 네비게이션

- 기존 `(main)` 레이아웃 헤더에 커뮤니티/공지사항 메뉴 추가
- 관리자 별도 페이지 불필요 (일반 페이지에서 직접 관리)
