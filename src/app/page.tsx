"use client";

import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function MarketingLanding() {
  const { t, tn, toggleLocale } = useI18n();

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1800&q=85"
          alt=""
          fill
          priority
          className="object-cover animate-kenburns"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1814]/78 via-[#1a1814]/35 to-[#1a1814]/20" />
        <div className="absolute inset-0 bg-gradient-to-e from-[#1a1814]/45 to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-5 py-5 md:px-10">
          <p className="font-display text-3xl tracking-tight text-white md:text-4xl animate-fade-in">
            {tn("تنسيق", "Tansiq")}
          </p>
          <button
            type="button"
            onClick={toggleLocale}
            className="text-xs tracking-wide text-white/80 hover:text-white"
          >
            {t("lang")}
          </button>
        </div>

        <div className="mt-auto flex max-w-xl flex-col gap-5 px-5 pb-12 pt-24 md:px-10 md:pb-16">
          <h1 className="font-display text-4xl leading-[1.15] text-white text-balance animate-rise md:text-5xl lg:text-6xl">
            {t("tagline")}
          </h1>
          <p className="max-w-md text-base leading-relaxed text-white/85 animate-rise-delay md:text-lg">
            {t("heroSupport")}
          </p>
          <div className="flex flex-wrap gap-3 animate-rise-delay">
            <Link
              href="/home"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full bg-white px-7 text-ink hover:bg-white/90",
              )}
            >
              {t("marketingEnter")}
            </Link>
            <Link
              href="/style"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-11 rounded-full border-white/40 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              {t("ctaStyle")}
            </Link>
          </div>
          <Link
            href="/seller/upload"
            className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            {t("ctaSeller")}
          </Link>
        </div>
      </div>
    </div>
  );
}
