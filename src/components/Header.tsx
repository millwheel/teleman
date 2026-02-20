import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import HeaderNav from "./HeaderNav";

export default async function Header() {
  const session = await getSession();

  let userName: string | undefined;
  if (session) {
    const { data } = await supabase
      .from("users")
      .select("nickname")
      .eq("id", session.userId)
      .single();
    userName = data?.nickname ?? session.userId.toString();
  }

  return <HeaderNav isLoggedIn={!!session} userName={userName} />;
}
