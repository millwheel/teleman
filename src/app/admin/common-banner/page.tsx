import { supabase } from "@/lib/supabase";
import { getPublicImageUrl } from "@/lib/storage";
import ImageBannerManager from "@/components/admin/ImageBannerManager";

export default async function CommonBannerPage() {
  const { data: banners } = await supabase
    .from("common_banner")
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
      apiPath="/api/admin/common-banners"
      title="광고배너 관리"
    />
  );
}
