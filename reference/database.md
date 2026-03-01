# 커뮤니티 / 공지사항 DB 스키마

## community

```sql
create table community (
  id bigint generated always as identity primary key,
  category text not null,
  title text not null,
  content text not null,
  author_id bigint not null references users(id),
  view_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_community_category on community(category);
create index idx_community_created_at on community(created_at desc);
```

## notice

```sql
create table notice (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null,
  author_id bigint not null references users(id),
  view_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notice_created_at on notice(created_at desc);
```

## community_comment

```sql
create table community_comment (
  id bigint generated always as identity primary key,
  post_id bigint not null references community(id) on delete cascade,
  author_id bigint not null references users(id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_community_comment_post_id on community_comment(post_id);
```

## notice_comment

```sql
create table notice_comment (
  id bigint generated always as identity primary key,
  post_id bigint not null references notice(id) on delete cascade,
  author_id bigint not null references users(id),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notice_comment_post_id on notice_comment(post_id);
```

## category 값 참고

`community.category` 컬럼에 들어갈 값 (코드 상수로 관리, DB 제약 없음):

| key | label |
|-----|-------|
| `free` | 자유게시판 |
| `betting` | 베팅게시판 |
| `review` | 후기게시판 |
| `gallery` | 섹시갤러리 |
