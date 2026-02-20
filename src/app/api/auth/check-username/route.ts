import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const nickname = searchParams.get("nickname");

  if (username) {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    return NextResponse.json({ taken: !!data });
  }

  if (nickname) {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("nickname", nickname)
      .maybeSingle();
    return NextResponse.json({ taken: !!data });
  }

  return NextResponse.json({ taken: false });
}
