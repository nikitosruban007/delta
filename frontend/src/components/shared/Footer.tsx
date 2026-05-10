"use client";

import { useLanguage } from "@/contexts/language-context";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto w-full border-t border-[#E0E0E0] bg-[#EAEAEA] py-6 text-center text-[12px] font-medium text-[#666]">
      <p>{t("footer.rights")}</p>
      <p className="mt-1">
        <span className="cursor-pointer hover:underline">[{t("footer.policy")}]</span>
        {" | "}
        <span className="cursor-pointer hover:underline">[{t("footer.terms")}]</span>
        {" | "}
        <span className="cursor-pointer hover:underline">[{t("footer.contacts")}]</span>
      </p>
    </footer>
  );
}
