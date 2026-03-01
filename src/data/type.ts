export type BannerType = "long" | "short";

export type AdBanner = {
  id: number;
  name: string;
  link: string;
  type: BannerType;
  public_url: string;
};

export type GuaranteeBanner = {
  id: number;
  name: string;
  link: string;
  public_url: string;
};

export type LinkCategory = {
  code: string;
  name: string;
  sort_order: number;
  icon?: string;
};

export type LinkItem = {
  id: number;
  name: string;
  link: string;
  description: string | null;
  category_code: string;
  image_path: string | null;
  public_url: string | null;
  likes: number;
};

export type BannerFormState = {
  name: string;
  link: string;
  description: string;
  likes: number;
};

// 커뮤니티 / 공지사항

export type CommunityPost = {
  id: number;
  category: string;
  title: string;
  content: string;
  author_id: number;
  author_nickname: string;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type NoticePost = {
  id: number;
  title: string;
  content: string;
  author_id: number;
  author_nickname: string;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type PostComment = {
  id: number;
  post_id: number;
  author_id: number;
  author_nickname: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type PostListResponse = {
  data: (CommunityPost | NoticePost)[];
  totalCount: number;
  page: number;
  pageSize: number;
};
