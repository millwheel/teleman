import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";
import ImageBannerManager from "@/components/admin/ImageBannerManager";

export default async function ImageBannerPage() {
  const { data: banners } = await supabase
    .from("image_banner")
    .select("*")
    .order("created_at");

  const mapped = (banners ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    link: b.link,
    public_url: getPublicImageUrl(b.image_url),
  }));

  return (
    <ImageBannerManager
      banners={mapped}
      apiPath="/api/admin/image-banners"
      title="보증업체 관리"
    />
  );
}
