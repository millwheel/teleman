"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProfileFormProps {
  username: string;
  initialNickname: string;
  initialImageUrl: string | null;
}

export default function ProfileForm({
  username,
  initialNickname,
  initialImageUrl,
}: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(initialNickname);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleDeleteImage() {
    if (!confirm("프로필 사진을 삭제하시겠습니까?")) return;
    setSaving(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/profile/delete-image", { method: "POST" });
    setSaving(false);

    if (res.ok) {
      setImageUrl(null);
      setPreviewUrl(null);
      setSelectedFile(null);
      setSuccess("프로필 사진이 삭제되었습니다.");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.message ?? "삭제 중 오류가 발생했습니다.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (showPasswordForm) {
      if (newPassword.length < 8) {
        setError("비밀번호는 8자 이상이어야 합니다.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    setSaving(true);

    const formData = new FormData();
    formData.append("nickname", nickname);
    if (selectedFile) formData.append("image", selectedFile);
    if (showPasswordForm && newPassword) formData.append("password", newPassword);

    const res = await fetch("/api/profile/update", {
      method: "POST",
      body: formData,
    });

    setSaving(false);

    if (res.ok) {
      const data = await res.json();
      setImageUrl(data.imageUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowPasswordForm(false);
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("프로필이 저장되었습니다.");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.message ?? "저장 중 오류가 발생했습니다.");
    }
  }

  const displayImageUrl = previewUrl ?? imageUrl;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-foreground">
          프로필 수정
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로필 사진 */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              {displayImageUrl ? (
                <Image
                  src={displayImageUrl}
                  alt="프로필 사진"
                  width={96}
                  height={96}
                  className="rounded-full object-cover w-24 h-24 ring-2 ring-gray-200 group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-400 ring-2 ring-gray-200 group-hover:bg-gray-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </span>
              )}
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs shadow">
                ✎
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {displayImageUrl && (
              <button
                type="button"
                onClick={handleDeleteImage}
                className="text-xs text-eliminate hover:underline"
              >
                사진 삭제
              </button>
            )}
          </div>

          {/* 아이디 (수정 불가) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              아이디
            </label>
            <input
              type="text"
              value={username}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* 닉네임 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {/* 비밀번호 변경 */}
          <div>
            <button
              type="button"
              onClick={() => {
                setShowPasswordForm((v) => !v);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary cursor-pointer"
            >
              {showPasswordForm ? "비밀번호 변경 취소" : "비밀번호 변경"}
            </button>

            {showPasswordForm && (
              <div className="mt-3 space-y-3">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 (8자 이상)"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 확인"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-eliminate">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-600">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-60 transition-opacity cursor-pointer"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>
    </div>
  );
}
