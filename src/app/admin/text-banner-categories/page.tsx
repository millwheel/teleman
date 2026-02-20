import { supabase } from "@/lib/supabase";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function TextBannerCategoriesPage() {
  const { data: categories } = await supabase
    .from("text_banner_categories")
    .select("*")
    .order("sort_order");

  return <CategoryManager categories={categories ?? []} />;
}
