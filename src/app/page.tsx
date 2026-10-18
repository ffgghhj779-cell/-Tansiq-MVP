"use client";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { buttonVariants } from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function MarketingLanding() {
  const { t, tn, toggleLocale } = useI18n();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#1c1917]">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          quality={80}
          className="object-cover animate-kenburns"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917]/90 via-[#1c1917]/40 to-[#1c1917]/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgba(201,184,160,0.18),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-4 py-5 md:px-12">
          <div className="animate-fade-in">
            <BrandLockup
              href="/home"
              tone="inverse"
              size="sm"
              mark="svg"
              showSlogan
            />
          </div>
          <button
            type="button"
            onClick={toggleLocale}
            className="pressable shrink-0 text-[11px] uppercase tracking-[0.2em] text-white/75"
          >
            {t("lang")}
          </button>
        </div>

        <div className="mt-auto flex max-w-2xl flex-col gap-5 px-4 pb-[max(3.5rem,env(safe-area-inset-bottom))] pt-24 md:px-12 md:pb-20">
          <p className="text-[10px] uppercase tracking-[0.32em] text-champagne animate-fade-in">
            {tn("الرياض · جدة", "Riyadh · Jeddah")}
          </p>
          <div className="animate-rise">
            <BrandLockup
              href={null}
              tone="inverse"
              size="lg"
              showSlogan
              mark="photo"
            />
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-white/78 animate-rise-delay md:text-lg">
            {t("heroSupport")}
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap animate-rise-delay">
            <Link
              href="/onboarding"
              className={cn(
                buttonVariants({ size: "lg" }),
                "pressable h-12 w-full rounded-none bg-sand px-8 text-[12px] tracking-[0.12em] text-ink hover:bg-sand/90 sm:w-auto",
              )}
            >
              {t("marketingEnter")}
            </Link>
            <Link
              href="/style"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "pressable h-12 w-full rounded-none border-white/35 bg-transparent px-8 text-[12px] tracking-[0.12em] text-white hover:bg-white/10 hover:text-white sm:w-auto",
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
