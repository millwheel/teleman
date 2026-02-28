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
