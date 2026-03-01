import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { NoticePost } from "@/data/type";
import NoticeEditClient from "./NoticeEditClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NoticeEditPage({ params }: Props) {
  const { id } = await params;

  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/notice/${id}`, { cache: "no-store" });
  if (!res.ok) notFound();

  const post = (await res.json()) as NoticePost;

  return <NoticeEditClient post={post} />;
}
