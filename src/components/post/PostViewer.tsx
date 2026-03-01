"use client";

type PostViewerProps = {
  content: string;
};

export default function PostViewer({ content }: PostViewerProps) {
  return (
    <div
      className="prose max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
