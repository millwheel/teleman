"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CheckStatus = "idle" | "checking" | "ok" | "taken";

function useDebounceCheck(value: string, field: "username" | "nickname") {
  const [status, setStatus] = useState<CheckStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value) {
      setStatus("idle");
      return;
    }

    setStatus("checking");

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const param = field === "username" ? `username=${value}` : `nickname=${value}`;
      const res = await fetch(`/api/auth/check-username?${param}`);
      const data = await res.json();
      setStatus(data.taken ? "taken" : "ok");
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, field]);

  return status;
}

function FieldHint({ status, okMsg, takenMsg }: {
  status: CheckStatus;
  okMsg: string;
  takenMsg: string;
}) {
  if (status === "checking") return <p className="mt-1 text-xs text-gray-400">확인 중...</p>;
  if (status === "ok") return <p className="mt-1 text-xs text-green-600">{okMsg}</p>;
  if (status === "taken") return <p className="mt-1 text-xs text-eliminate">{takenMsg}</p>;
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const usernameStatus = useDebounceCheck(username, "username");
  const nicknameStatus = useDebounceCheck(nickname, "nickname");

  const canSubmit =
    usernameStatus === "ok" &&
    nicknameStatus === "ok" &&
    password.length >= 4 &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (usernameStatus === "taken") {
      setError("이미 사용 중인 아이디입니다.");
      return;
    }
    if (nicknameStatus === "taken") {
      setError("이미 사용 중인 닉네임입니다.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, nickname, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold text-foreground">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 아이디 */}
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              아이디
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="영문, 숫자 조합"
              required
              autoComplete="username"
              className={cn(
                "w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 transition",
                usernameStatus === "taken"
                  ? "border-eliminate focus:border-eliminate focus:ring-eliminate/20"
                  : usernameStatus === "ok"
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                  : "border-gray-300 focus:border-primary focus:ring-primary/20"
              )}
            />
            <FieldHint
              status={usernameStatus}
              okMsg="사용 가능한 아이디입니다."
              takenMsg="이미 사용 중인 아이디입니다."
            />
          </div>

          {/* 닉네임 */}
          <div>
            <label
              htmlFor="nickname"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="사용할 닉네임"
              required
              className={cn(
                "w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 transition",
                nicknameStatus === "taken"
                  ? "border-eliminate focus:border-eliminate focus:ring-eliminate/20"
                  : nicknameStatus === "ok"
                  ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                  : "border-gray-300 focus:border-primary focus:ring-primary/20"
              )}
            />
            <FieldHint
              status={nicknameStatus}
              okMsg="사용 가능한 닉네임입니다."
              takenMsg="이미 사용 중인 닉네임입니다."
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="4자 이상"
              required
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-eliminate">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? "처리 중..." : "가입하기"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-secondary"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
