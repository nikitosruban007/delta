"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import {
  AuthShell,
  Field,
  PasswordField,
} from "@/components/shared/AuthShell";
import { assets } from "@/lib/assets";
import { useAuth } from "@/contexts/auth-context";
import { ApiError, authApi } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(6, "Пароль мінімум 6 символів"),
});

type FormState = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSocialLogin = (provider: "google" | "github") => {
    window.location.href = authApi.socialAuthUrl(provider);
  };

  const handleChange = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<FormState> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormState;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(
          error.status === 401
            ? "Невірний email або пароль"
            : error.message,
        );
      } else {
        setServerError("Сталася помилка. Спробуйте ще раз.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Вхід">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <Field
            icon="mail"
            placeholder="Електронна пошта"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
          <PasswordField
            placeholder="Пароль"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange("password")}
            error={errors.password}
          />
          {serverError && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}
          <div className="text-right">
            <button
              type="button"
              className="text-base font-medium italic text-[#526079] underline-offset-4 transition hover:text-[#1f62df] hover:underline"
            >
              Забули пароль?
            </button>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="block w-full rounded-xl bg-[#74adfb] px-6 py-4 text-center text-[17px] font-semibold leading-tight text-[#0b3269] shadow-[0_14px_30px_rgba(60,126,219,0.24)] transition hover:bg-[#8fbeff] disabled:opacity-60"
          >
            {isSubmitting ? "Вхід..." : "Вхід"}
          </button>
        </div>
      </form>

      <div className="my-6 border-t border-[#d8e0ed]" />

      <p className="mb-4 text-center text-lg font-semibold text-[#526079]">
        Увійти через
      </p>
      <div className="mb-6 flex justify-center gap-5">
        <button
          type="button"
          aria-label="Увійти через Google"
          onClick={() => handleSocialLogin("google")}
          className="rounded-2xl border border-[#d8e0ed] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Image src={assets.google} alt="" width={44} height={44} />
        </button>
        <button
          type="button"
          aria-label="Увійти через GitHub"
          onClick={() => handleSocialLogin("github")}
          className="rounded-2xl border border-[#d8e0ed] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Image src={assets.github} alt="" width={44} height={44} />
        </button>
      </div>

      <div className="mt-4 text-center">
        <span className="text-lg text-[#526079]">Ще не маєте акаунту? </span>
        <Link
          href="/register"
          className="text-lg font-medium text-[#0a3268] underline transition hover:text-[#1f62df]"
        >
          [Зареєструватись]
        </Link>
      </div>
    </AuthShell>
  );
}
