"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  return (
    <main className="min-h-screen bg-[#efefef]">
      <div className="w-full bg-[#143973]">
        <div className="mx-auto flex h-[90px] w-full max-w-[1200px] items-center px-6">
          <Link
            href="/"
            className="rounded-2xl bg-[#84b6f5] px-5 py-2 text-[16px] text-[#132643] transition hover:bg-[#9ec5f8]"
          >
            ← Повернутися на головну сторінку
          </Link>
        </div>
      </div>

      <section className="mx-auto flex w-full max-w-[1200px] justify-center px-4 pb-14 pt-12">
        <div className="relative w-full max-w-[620px]">
          <Image src="/image/orange_ellipse.png" alt="" width={72} height={72} className="pointer-events-none absolute -left-8 -top-8 z-0" />
          <Image src="/image/red_ellipse.png" alt="" width={72} height={72} className="pointer-events-none absolute -right-8 -top-8 z-0" />
          <Image src="/image/red_ellipse.png" alt="" width={72} height={72} className="pointer-events-none absolute -bottom-8 -left-8 z-0 rotate-180" />
          <Image src="/image/orange_ellipse.png" alt="" width={72} height={72} className="pointer-events-none absolute -bottom-8 -right-8 z-0 rotate-180" />

          <div className="relative z-10 w-full border border-[#4e6478] bg-[#efefef] px-9 pb-7 pt-5 max-md:px-5">
            <div className="mb-8 flex items-center justify-center gap-3">
              <h1 className="text-[42px] font-semibold text-black underline">Реєстрація</h1>
              <Image src="/image/orange_icon.png" alt="" width={48} height={48} />
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Прізвище"
                  className="h-[40px] w-full bg-[#dfdddd] px-12 text-[18px] text-[#252525] placeholder:text-[#252525] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Ім'я"
                  className="h-[40px] w-full bg-[#dfdddd] px-12 text-[18px] text-[#252525] placeholder:text-[#252525] focus:outline-none"
                />
              </div>

              <input
                type="email"
                placeholder="Електронна пошта"
                className="h-[40px] w-full bg-[#dfdddd] px-12 text-[18px] text-[#252525] placeholder:text-[#252525] focus:outline-none"
              />

              <input
                type="text"
                placeholder="Логін"
                className="h-[40px] w-full bg-[#dfdddd] px-12 text-[18px] text-[#252525] placeholder:text-[#252525] focus:outline-none"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Пароль"
                  className="h-[40px] w-full bg-[#dfdddd] px-12 pr-12 text-[18px] text-[#252525] placeholder:text-[#252525] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label="Показати або приховати пароль"
                >
                  <Image src="/image/eye.png" alt="" width={18} height={18} />
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="Підтвердити свій пароль"
                  className="h-[40px] w-full bg-[#dfdddd] px-12 pr-12 text-[18px] text-[#252525] placeholder:text-[#252525] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  aria-label="Показати або приховати підтвердження пароля"
                >
                  <Image src="/image/eye.png" alt="" width={18} height={18} />
                </button>
              </div>
            </div>

            <Link
              href="/profile-setup"
              className="mt-16 block w-full rounded-2xl bg-[#81a9de] py-2 text-center text-[40px] text-[#1c2d47] transition hover:bg-[#91b8ea] max-md:text-[30px]"
            >
              Зареєструватися
            </Link>

            <div className="mt-4 text-right">
              <Link href="/login" className="cursor-pointer text-[20px] text-[#4a4a4a] underline transition hover:text-[#2f2f2f]">
                Вже маєте акаунт?
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
