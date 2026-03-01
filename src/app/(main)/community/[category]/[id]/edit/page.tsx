import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { CommunityPost } from "@/data/type";
import CommunityEditClient from "./CommunityEditClient";

type Props = {
  params: Promise<{ category: string; id: string }>;
};

export default async function CommunityEditPage({ params }: Props) {
  const { category, id } = await params;

  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/community/${id}`, { cache: "no-store" });
  if (!res.ok) notFound();

  const post = (await res.json()) as CommunityPost;

  return <CommunityEditClient post={post} category={category} />;
}
