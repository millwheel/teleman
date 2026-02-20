import { supabase } from "./supabase";

const BUCKET = "public-media";

export function getPublicImageUrl(imagePath: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(imagePath);
  return data.publicUrl;
}

export async function uploadImage(
  path: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType,
    upsert: false,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  return path;
}

export async function deleteImage(imagePath: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([imagePath]);
}
