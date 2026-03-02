import { v4 as uuidv4 } from "uuid";
import { uploadImage, deleteImage } from "./storage";

/**
 * HTML 본문에서 base64 이미지를 추출하여 Storage에 업로드하고 URL로 치환한다.
 * @returns 치환된 HTML과 업로드된 이미지 경로 목록
 */
export async function processContentImages(
  html: string,
  folder: string,
  postId?: number
): Promise<{ html: string; imagePaths: string[] }> {
  const base64Regex = /<img[^>]+src="data:([^;]+);base64,([^"]+)"[^>]*>/g;
  const imagePaths: string[] = [];
  let result = html;

  const matches = [...html.matchAll(base64Regex)];
  for (const match of matches) {
    const contentType = match[1];
    const base64Data = match[2];
    const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const basePath = postId ? `${folder}/${postId}` : folder;
    const path = `${basePath}/${uuidv4()}.${ext}`;

    const buffer = Buffer.from(base64Data, "base64");
    await uploadImage(path, buffer, contentType);
    imagePaths.push(path);

    const { getPublicImageUrl } = await import("./storage");
    const publicUrl = getPublicImageUrl(path);
    result = result.replace(match[0], match[0].replace(`data:${contentType};base64,${base64Data}`, publicUrl));
  }

  return { html: result, imagePaths };
}

/**
 * 이전 HTML과 새 HTML을 비교하여, 더 이상 사용되지 않는 이미지를 삭제한다.
 */
export async function cleanupRemovedImages(
  oldHtml: string,
  newHtml: string,
  bucketBaseUrl: string
): Promise<void> {
  const urlRegex = /src="([^"]+)"/g;

  const extractUrls = (html: string) => {
    const urls = new Set<string>();
    for (const match of html.matchAll(urlRegex)) {
      if (match[1].includes(bucketBaseUrl)) urls.add(match[1]);
    }
    return urls;
  };

  const oldUrls = extractUrls(oldHtml);
  const newUrls = extractUrls(newHtml);

  for (const url of oldUrls) {
    if (!newUrls.has(url)) {
      // URL에서 storage path 추출
      const pathStart = url.indexOf("/public-media/");
      if (pathStart !== -1) {
        const storagePath = url.substring(pathStart + "/public-media/".length);
        await deleteImage(storagePath);
      }
    }
  }
}
