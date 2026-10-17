"use client";

import { buttonVariants } from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function MarketingLanding() {
  const { t, tn, toggleLocale } = useI18n();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink">
      {/* Full-bleed boutique atmosphere — garments, not revealing models */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover animate-kenburns"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12100e]/88 via-[#12100e]/45 to-[#12100e]/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(250,249,246,0.12),transparent_55%)]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-5 py-6 md:px-12">
          <p className="font-display text-[2rem] tracking-[0.02em] text-white md:text-5xl animate-fade-in">
            {tn("تنسيق", "Tansiq")}
          </p>
          <button
            type="button"
            onClick={toggleLocale}
            className="text-[11px] uppercase tracking-[0.18em] text-white/75 hover:text-white"
          >
            {t("lang")}
          </button>
        </div>

        <div className="mt-auto flex max-w-2xl flex-col gap-6 px-5 pb-14 pt-28 md:px-12 md:pb-20">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 animate-fade-in">
            {tn("الرياض · جدة", "Riyadh · Jeddah")}
          </p>
          <h1 className="font-display text-[2.65rem] leading-[1.08] text-white text-balance animate-rise md:text-6xl lg:text-7xl">
            {t("tagline")}
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-white/80 animate-rise-delay md:text-lg">
            {t("heroSupport")}
          </p>
          <div className="flex flex-wrap gap-3 animate-rise-delay">
            <Link
              href="/home"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-none bg-white px-8 text-[13px] tracking-wide text-ink hover:bg-white/92",
              )}
            >
              {t("marketingEnter")}
            </Link>
            <Link
              href="/style"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 rounded-none border-white/35 bg-transparent px-8 text-[13px] tracking-wide text-white hover:bg-white/10 hover:text-white",
              )}
            >
              {t("ctaStyle")}
            </Link>
          </div>
          <Link
            href="/seller/upload"
            className="text-sm text-white/55 underline-offset-4 hover:text-white hover:underline"
          >
            {t("ctaSeller")}
          </Link>
        </div>
      </div>
    </div>
  );
}
