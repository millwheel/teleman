import { getSession } from "@/lib/auth";
import ScammerResultList from "@/components/ScammerResultList";

export default async function ScammerResultPage() {
  const session = await getSession();
  return <ScammerResultList isLoggedIn={!!session} />;
}
