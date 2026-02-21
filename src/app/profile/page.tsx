import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

const STORAGE_BASE = `${process.env.SUPABASE_URL}/storage/v1/object/public/public-media`;

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/profile");

  const { data: user } = await supabase
    .from("users")
    .select("username, nickname, image_path")
    .eq("id", session.userId)
    .single();

  if (!user) redirect("/login");

  const imageUrl = user.image_path ? `${STORAGE_BASE}/${user.image_path}` : null;

  return (
    <ProfileForm
      username={user.username}
      initialNickname={user.nickname}
      initialImageUrl={imageUrl}
    />
  );
}
