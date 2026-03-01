# 커뮤니티 / 공지사항 구현 작업

> 참고: [post-job.md](reference/post-job.md), [database.md](reference/database.md)

## 0. 사전 준비

- [x] DB 테이블 생성 (database.md 기준, 사용자가 직접 반영)
- [ ] TipTap simple-editor 설치 (`npx @tiptap/cli@latest add simple-editor`)
- [ ] `src/data/communityCategories.ts` — 카테고리 상수 정의
- [ ] `src/data/type.ts` — 타입 추가 (`CommunityPost`, `NoticePost`, `CommunityComment`, `NoticeComment`, `CommunityCategory`)

## 1. API Routes

### 1-1. 커뮤니티 API

- [ ] `GET /api/community?category=&page=` — 목록 조회 (페이지네이션, 카테고리 필터)
- [ ] `GET /api/community/[id]` — 상세 조회 (view_count 증가 포함)
- [ ] `POST /api/community` — 글 생성 (로그인 필요)
- [ ] `PUT /api/community/[id]` — 글 수정 (본인만)
- [ ] `DELETE /api/community/[id]` — 글 삭제 (본인 + admin)

### 1-2. 공지사항 API

- [ ] `GET /api/notice?page=` — 목록 조회 (페이지네이션)
- [ ] `GET /api/notice/[id]` — 상세 조회 (view_count 증가 포함)
- [ ] `POST /api/notice` — 글 생성 (admin만)
- [ ] `PUT /api/notice/[id]` — 글 수정 (admin만)
- [ ] `DELETE /api/notice/[id]` — 글 삭제 (admin만)

### 1-3. 댓글 API

- [ ] `GET /api/community/[id]/comments` — 커뮤니티 댓글 목록
- [ ] `POST /api/community/[id]/comments` — 커뮤니티 댓글 작성 (로그인 필요)
- [ ] `PUT /api/community/comments/[commentId]` — 커뮤니티 댓글 수정 (본인만)
- [ ] `DELETE /api/community/comments/[commentId]` — 커뮤니티 댓글 삭제 (본인 + admin)
- [ ] `GET /api/notice/[id]/comments` — 공지사항 댓글 목록
- [ ] `POST /api/notice/[id]/comments` — 공지사항 댓글 작성 (로그인 필요)
- [ ] `PUT /api/notice/comments/[commentId]` — 공지사항 댓글 수정 (본인만)
- [ ] `DELETE /api/notice/comments/[commentId]` — 공지사항 댓글 삭제 (본인 + admin)

### 1-4. 이미지 처리

별도 업로드 API 없음. 글 생성/수정 API 내에서 처리.

- 에디터에서 이미지 삽입 시 브라우저 Blob URL로 임시 보관
- 글 저장(POST/PUT) 시 본문 HTML에서 Blob 이미지를 추출 → base64로 전송
- API에서 base64 이미지를 public-media 버킷에 업로드 → URL 치환 후 DB 저장
- 글 수정 시 삭제된 이미지는 Storage에서도 제거

## 2. 공용 컴포넌트

- [ ] `PostList` — 게시글 목록 테이블 (번호, 제목, 작성자, 작성날짜, 조회수)
- [ ] `PostPagination` — 기존 `Pagination` 컴포넌트 재활용 (서버 → 클라이언트 페이지 전환 연결)
- [ ] `PostEditor` — TipTap simple-editor 래퍼 (생성/수정 공용, 이미지는 Blob URL로 삽입 → 저장 시 base64 변환)
- [ ] `PostViewer` — TipTap 기반 본문 렌더링
- [ ] `CommentSection` — 댓글 목록 + 댓글 작성 폼 (본인 수정/삭제, admin 삭제 버튼)

## 3. 커뮤니티 페이지

### 3-1. 라우트 구조

```
src/app/(main)/community/
  page.tsx                        → /community (첫 번째 카테고리로 redirect)
  [category]/
    page.tsx                      → /community/free 등 (목록)
    write/page.tsx                → 글 작성
    [id]/
      page.tsx                    → 글 상세
      edit/page.tsx               → 글 수정
```

### 3-2. 페이지별 작업

- [ ] `/community` — 첫 번째 카테고리(free)로 redirect
- [ ] `/community/[category]` — 목록 페이지 (카테고리 탭 + PostList + Pagination)
- [ ] `/community/[category]/[id]` — 상세 페이지 (PostViewer + CommentSection)
- [ ] `/community/[category]/write` — 글 작성 페이지 (PostEditor)
- [ ] `/community/[category]/[id]/edit` — 글 수정 페이지 (PostEditor, 기존 데이터 로드)

## 4. 공지사항 페이지

### 4-1. 라우트 구조

```
src/app/(main)/notice/
  page.tsx                        → /notice (목록)
  write/page.tsx                  → 글 작성 (admin)
  [id]/
    page.tsx                      → 글 상세
    edit/page.tsx                 → 글 수정 (admin)
```

### 4-2. 페이지별 작업

- [ ] `/notice` — 목록 페이지 (PostList + Pagination)
- [ ] `/notice/[id]` — 상세 페이지 (PostViewer + CommentSection)
- [ ] `/notice/write` — 글 작성 페이지 (admin 전용)
- [ ] `/notice/[id]/edit` — 글 수정 페이지 (admin 전용)

## 5. 네비게이션 수정

- [ ] `HeaderNav.tsx` — 커뮤니티 링크를 `/community/free`로 변경
- [ ] `HamburgerMenu.tsx` — 동일하게 변경

## 작업 순서

1. **사전 준비** (0) — DB 반영, TipTap 설치, 타입/상수 정의
2. **API** (1) — 커뮤니티 → 공지사항 → 댓글 (이미지 처리는 생성/수정 API에 포함)
3. **공용 컴포넌트** (2) — PostList, PostEditor, PostViewer, CommentSection
4. **커뮤니티 페이지** (3)
5. **공지사항 페이지** (4)
6. **네비게이션** (5)
