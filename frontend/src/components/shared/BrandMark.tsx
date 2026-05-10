import Image from "next/image";
import Link from "next/link";

import { assets } from "@/lib/assets";

type BrandMarkProps = {
  dark?: boolean;
};

export default function BrandMark({ dark = true }: BrandMarkProps) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="FoldUP">
      <span className={`text-[34px] font-medium leading-none tracking-tight md:text-[42px] ${dark ? "text-white" : "text-[#061733]"}`}>
        FoldUp
      </span>
      <Image src={assets.mark} alt="" width={45} height={34} className="h-8 w-auto md:h-10" priority />
    </Link>
  );
}
