"use client";

type PostViewerProps = {
  content: string;
};

export default function PostViewer({ content }: PostViewerProps) {
  return (
    <div
      className="prose max-w-none bg-background rounded-lg p-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img[data-align=center]]:block [&_img[data-align=center]]:mx-auto [&_img[data-align=right]]:block [&_img[data-align=right]]:ml-auto [&_img[data-align=right]]:mr-0"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
