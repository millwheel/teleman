import { getSession } from "@/lib/auth";
import AdminHeaderNav from "./AdminHeaderNav";
import LogoBrand from "./LogoBrand";

const STORAGE_BASE = `${process.env.SUPABASE_URL}/storage/v1/object/public/public-media`;

export default async function AdminHeader() {
  const session = await getSession();
  const imageUrl = session?.imagePath ? `${STORAGE_BASE}/${session.imagePath}` : null;

  return (
      <header className="relative w-full border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* 로고 */}
        <LogoBrand />
      </div>

      <AdminHeaderNav userName={session?.nickname} imageUrl={imageUrl} />
    </header>
  );
}
