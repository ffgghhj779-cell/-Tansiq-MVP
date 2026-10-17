"use client";

import { ProductCard } from "@/components/product/product-card";
import { LOOKS, PRODUCTS, formatSar } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";

export default function BuyerHomePage() {
  const { t, tn, locale } = useI18n();
  const budget = PRODUCTS.filter((p) => p.budgetFriendly).slice(0, 4);
  const indie = PRODUCTS.filter((p) => p.independent).slice(0, 4);

  return (
    <div className="space-y-10 pb-6">
      {/* Trust strip — one job */}
      <section
        aria-label="Trust"
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-y border-border/50 py-3 text-center text-xs text-muted-foreground md:text-sm"
      >
        <span>{t("trustDelivery")}</span>
        <span className="hidden text-border sm:inline">·</span>
        <span>{t("trustReturns")}</span>
        <span className="hidden text-border sm:inline">·</span>
        <span>{t("trustProtect")}</span>
      </section>

      {/* Looks for today */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            {t("looksToday")}
          </h2>
          <Link href="/style" className="text-sm text-olive hover:underline">
            {t("ctaStyle")}
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LOOKS.map((look) => (
            <Link
              key={look.id}
              href={`/style?tool=complete&look=${look.id}`}
              className="group relative w-[78vw] max-w-sm shrink-0 overflow-hidden md:w-80"
            >
              <div className="relative aspect-[4/5] bg-mist">
                <Image
                  src={look.cover}
                  alt={tn(look.titleAr, look.titleEn)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="320px"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16">
                  <p className="font-display text-xl text-white">
                    {tn(look.titleAr, look.titleEn)}
                  </p>
                  <p className="mt-1 text-xs text-white/80">
                    {tn(look.reasonAr, look.reasonEn)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Under budget */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              {t("underBudget")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tn("حتى ٢٠٠ ر.س تقريبًا", "Around SAR 200 and under")}
            </p>
          </div>
          <Link href="/products?filter=budget" className="text-sm text-olive">
            {t("seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {budget.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Independent labels */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            {t("indie")}
          </h2>
          <Link href="/products?filter=indie" className="text-sm text-olive">
            {t("seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {indie.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Seasonal — single purpose */}
      <section className="atmosphere-panel border border-border/50 px-5 py-8 md:px-8">
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          {tn("مجموعات الموسم", "Seasonal collections")}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {tn(
            "جامعة، عمل خفيف، مقهى، سفر — إطلالات جاهزة للمناخ السعودي.",
            "Campus, soft work, café, travel — looks tuned for Saudi climate.",
          )}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["جامعة", "عمل خفيف", "مقهى", "سفر"].map((label, i) => (
            <Link
              key={label}
              href="/style?tool=budget"
              className="rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-ink transition hover:border-olive/40 hover:bg-accent"
            >
              {tn(label, ["Campus", "Soft work", "Café", "Travel"][i])}
            </Link>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          {tn("أسعار من", "From")} {formatSar(79, locale)}
        </p>
      </section>
    </div>
  );
}
