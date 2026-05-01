"use client";

import Link from "next/link";

import { AuthShell, Field, PasswordField, PrimarySubmitLink } from "@/components/shared/AuthShell";

export default function RegisterPage() {
  return (
    <AuthShell title="Реєстрація">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field icon="user-round" placeholder="Прізвище" autoComplete="family-name" />
          <Field icon="user" placeholder="Ім'я" autoComplete="given-name" />
        </div>
        <Field icon="mail" placeholder="Електронна пошта" type="email" autoComplete="email" />
        <Field icon="user" placeholder="Логін" autoComplete="username" />
        <PasswordField placeholder="Пароль" autoComplete="new-password" />
        <PasswordField placeholder="Підтвердити свій пароль" autoComplete="new-password" />
      </div>

      <div className="mt-8">
        <PrimarySubmitLink href="/profile-setup">Зареєструватися</PrimarySubmitLink>
      </div>

      <div className="mt-6 text-right">
        <Link href="/login" className="text-lg font-medium text-[#0a3268] underline transition hover:text-[#1f62df]">
          Вже маєте акаунт?
        </Link>
      </div>
    </AuthShell>
  );
}
