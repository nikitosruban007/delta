"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import {
  AuthShell,
  Field,
  PasswordField,
} from "@/components/shared/AuthShell";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api";

const registerSchema = z
  .object({
    name: z.string().min(2, "Ім'я мінімум 2 символи"),
    email: z.string().email("Введіть коректний email"),
    password: z.string().min(6, "Пароль мінімум 6 символів"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const parsed = registerSchema.safeParse(form);
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
      await register(form.email, form.password, form.name);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(
          error.status === 409
            ? "Акаунт з таким email вже існує"
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
    <AuthShell title="Реєстрація">
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <Field
            icon="user"
            placeholder="Повне ім'я"
            autoComplete="name"
            value={form.name}
            onChange={handleChange("name")}
            error={errors.name}
          />
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
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange("password")}
            error={errors.password}
          />
          <PasswordField
            placeholder="Підтвердіть пароль"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
          />

          {serverError && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}
        </div>

        <div className="mx-auto mt-8 max-w-[480px]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="block w-full rounded-xl bg-[#74adfb] px-6 py-4 text-center text-[17px] font-semibold leading-tight text-[#0b3269] shadow-[0_14px_30px_rgba(60,126,219,0.24)] transition hover:bg-[#8fbeff] disabled:opacity-60"
          >
            {isSubmitting ? "Реєстрація..." : "Зареєструватися"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <span className="text-lg text-[#526079]">Вже маєте акаунт? </span>
        <Link
          href="/login"
          className="text-lg font-medium text-[#0a3268] underline transition hover:text-[#1f62df]"
        >
          [Увійти]
        </Link>
      </div>
    </AuthShell>
  );
}
