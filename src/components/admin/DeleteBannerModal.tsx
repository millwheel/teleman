"use client";

import { useState } from "react";
import Modal from "./Modal";

type Props = {
  banner: { id: number; name: string };
  apiPath: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function DeleteBannerModal({ banner, apiPath, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`${apiPath}/${banner.id}`, { method: "DELETE" });
    setLoading(false);
    onSuccess();
  }

  return (
    <Modal title="배너 삭제" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{banner.name}</span> 배너를 삭제합니다.
          이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-eliminate px-4 py-2 text-sm font-semibold text-white hover:bg-eliminate-light disabled:opacity-60 transition-colors cursor-pointer"
          >
            {loading ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
