import { supabase } from "@/lib/supabase";
import ImageBannerManager from "@/components/admin/ImageBannerManager";

export default async function ImageBannerPage() {
  const { data: banners } = await supabase
    .from("image_banner")
    .select("*")
    .order("created_at");

  return (
    <ImageBannerManager
      banners={banners ?? []}
      apiPath="/api/admin/image-banners"
      title="보증업체 관리"
    />
  );
}
