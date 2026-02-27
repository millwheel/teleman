import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProfileForm from "../../../components/ProfileForm";

export default async function ProfilePage() {
  const headersList = await headers();
  const host = headersList.get("host")!;
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(`${proto}://${host}/api/profile`);

  if (res.status === 401) redirect("/login?redirect=/profile");
  if (!res.ok) redirect("/login");

  const user: { username: string; nickname: string; imageUrl: string | null } = await res.json();

  return (
    <ProfileForm
      username={user.username}
      initialNickname={user.nickname}
      initialImageUrl={user.imageUrl}
    />
  );
}
