export type BannerType = "long" | "short";

export type CommonBanner = {
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
};

export type LinkItem = {
  id: number;
  name: string;
  link: string;
  sort_order: number;
  category_id: number;
  image_path: string | null;
  likes: number;
};

export type BannerFormState = {
  name: string;
  link: string;
};
