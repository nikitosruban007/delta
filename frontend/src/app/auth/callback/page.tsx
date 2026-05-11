"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const TOKEN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      router.replace("/login?error=social_auth_failed");
      return;
    }

    localStorage.setItem("foldup_token", token);
    document.cookie = `foldup_token=${token}; Path=/; Max-Age=${TOKEN_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;

    // Full reload ensures AuthProvider re-reads localStorage token on mount.
    window.location.replace("/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f9ff] px-6">
      <p className="text-base text-[#0a3268]">Завершуємо вхід...</p>
    </main>
  );
}
