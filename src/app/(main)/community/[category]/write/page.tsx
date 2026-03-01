import { notFound } from "next/navigation";
import { COMMUNITY_CATEGORIES } from "@/data/communityCategories";
import CommunityWriteClient from "./CommunityWriteClient";

type Props = {
  params: Promise<{ category: string }>;
};

export default async function CommunityWritePage({ params }: Props) {
  const { category } = await params;
  const cat = COMMUNITY_CATEGORIES.find((c) => c.key === category);
  if (!cat) notFound();

  return <CommunityWriteClient category={category} categoryLabel={cat.label} />;
}
