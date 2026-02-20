import { supabase } from "@/lib/supabase";
import ImageBannerManager from "@/components/admin/ImageBannerManager";

export default async function CommonBannerPage() {
  const { data: banners } = await supabase
    .from("common_banner")
    .select("*")
    .order("created_at");

  return (
    <ImageBannerManager
      banners={banners ?? []}
      apiPath="/api/admin/common-banners"
      title="광고배너 관리"
    />
  );
}
