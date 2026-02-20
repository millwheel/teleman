import { supabase } from "@/lib/supabase";
import TextBannerManager from "@/components/admin/TextBannerManager";
import TextBannerDetail from "@/components/admin/TextBannerDetail";

export default async function TextBannerPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId: categoryIdStr } = await searchParams;
  const categoryId = categoryIdStr ? Number(categoryIdStr) : null;

  if (categoryId) {
    // 세부 관리 모드
    const [{ data: category }, { data: banners }] = await Promise.all([
      supabase
        .from("text_banner_categories")
        .select("id, name")
        .eq("id", categoryId)
        .single(),
      supabase
        .from("text_banners")
        .select("*")
        .eq("category_id", categoryId)
        .order("sort_order"),
    ]);

    if (!category) {
      return (
        <div className="text-center py-16 text-gray-400">
          카테고리를 찾을 수 없습니다.
        </div>
      );
    }

    return <TextBannerDetail category={category} banners={banners ?? []} />;
  }

  // 전체 오버뷰 모드
  const [{ data: categories }, { data: allBanners }] = await Promise.all([
    supabase
      .from("text_banner_categories")
      .select("id, name, sort_order")
      .order("sort_order"),
    supabase.from("text_banners").select("id, name, category_id").order("sort_order"),
  ]);

  type Banner = NonNullable<typeof allBanners>[number];
  const bannersByCategory = (allBanners ?? []).reduce<Record<number, Banner[]>>(
    (acc, b) => {
      if (!acc[b.category_id]) acc[b.category_id] = [];
      acc[b.category_id].push(b);
      return acc;
    },
    {}
  );

  return (
    <TextBannerManager
      categories={categories ?? []}
      bannersByCategory={bannersByCategory}
    />
  );
}
