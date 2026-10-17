"use client";

import { ProductCard } from "@/components/product/product-card";
import {
  CATEGORIES,
  EDITORIAL_BANNER,
  LOOKS,
  PRODUCTS,
  SELLERS,
  formatSar,
} from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";

export default function BuyerHomePage() {
  const { t, tn, locale } = useI18n();
  const budget = PRODUCTS.filter((p) => p.budgetFriendly).slice(0, 6);
  const indie = PRODUCTS.filter((p) => p.independent).slice(0, 6);
  const newest = PRODUCTS.filter((p) => p.tags.includes("new")).slice(0, 6);
  const bestsellers = PRODUCTS.filter((p) => p.tags.includes("bestseller")).slice(
    0,
    6,
  );
  const premium = PRODUCTS.filter((p) => p.tags.includes("premium")).slice(0, 4);
  const women = PRODUCTS.filter((p) => p.gender === "women").slice(0, 4);
  const men = PRODUCTS.filter((p) => p.gender === "men").slice(0, 4);

  return (
    <div className="space-y-10 pb-8 md:space-y-14">
      {/* Promo / trust — Namshi-like clarity, Tansiq tone */}
      <section
        aria-label="Trust"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-y border-border/60 bg-sand/70 py-3 text-center text-[10px] tracking-[0.04em] text-muted-foreground md:gap-x-5 md:text-[11px]"
      >
        <span>{t("trustDelivery")}</span>
        <span className="text-champagne/80">|</span>
        <span>{t("trustReturns")}</span>
        <span className="text-champagne/80">|</span>
        <span>{t("trustProtect")}</span>
        <span className="text-champagne/80">|</span>
        <span>{tn("دفع عند الاستلام", "Cash on delivery")}</span>
      </section>

      {/* Shop by category */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl tracking-tight text-ink md:text-3xl">
            {tn("تسوق حسب القسم", "Shop by category")}
          </h2>
          <Link href="/products" className="text-xs tracking-wide text-olive">
            {t("seeAll")}
          </Link>
        </div>
        <div className="h-scroll flex gap-3 pb-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?filter=${cat.id === "men" ? "men" : cat.id}`}
              className="group w-[28vw] min-w-[108px] max-w-[140px] shrink-0"
            >
              <div className="relative aspect-square overflow-hidden bg-mist">
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  sizes="140px"
                />
              </div>
              <p className="mt-2 text-center text-xs font-medium text-ink">
                {tn(cat.ar, cat.en)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Women / Men dual entry */}
      <section className="grid gap-3 md:grid-cols-2 md:gap-4">
        <Link href="/products?filter=women" className="group relative aspect-[16/10] overflow-hidden bg-mist md:aspect-[5/3]">
          <Image
            src={EDITORIAL_BANNER}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="font-display text-3xl text-white">{t("women")}</p>
            <p className="mt-1 text-xs text-white/80">
              {tn("كاجوال يومي مناسب للمحافظة", "Modest-friendly everyday casual")}
            </p>
          </div>
        </Link>
        <Link href="/products?filter=men" className="group relative aspect-[16/10] overflow-hidden bg-mist md:aspect-[5/3]">
          <Image
            src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80"
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="font-display text-3xl text-white">{t("men")}</p>
            <p className="mt-1 text-xs text-white/80">
              {tn("كاجوال وستريت محلي مختار", "Curated casual & local streetwear")}
            </p>
          </div>
        </Link>
      </section>

      {/* Looks for today */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              {t("looksToday")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tn("إطلالات مكتملة من الكتالوج", "Complete looks from the catalog")}
            </p>
          </div>
          <Link href="/style?tool=complete" className="text-sm text-olive hover:underline">
            {t("ctaStyle")}
          </Link>
        </div>
        <div className="h-scroll flex gap-4 pb-2">
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
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 pt-16">
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

      {/* New arrivals */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            {tn("وصل حديثًا", "New arrivals")}
          </h2>
          <Link href="/products" className="text-sm text-olive">
            {t("seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
          {(newest.length ? newest : PRODUCTS.slice(0, 6)).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl text-ink md:text-3xl">
            {tn("الأكثر مبيعًا", "Bestsellers")}
          </h2>
          <Link href="/products" className="text-sm text-olive">
            {t("seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
          {(bestsellers.length ? bestsellers : PRODUCTS.slice(0, 6)).map((p) => (
            <ProductCard key={p.id} product={p} />
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
              {tn("حتى ٢٢٠ ر.س تقريبًا", "Around SAR 220 and under")}
            </p>
          </div>
          <Link href="/products?filter=budget" className="text-sm text-olive">
            {t("seeAll")}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {budget.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Editorial mid-band */}
      <section className="relative aspect-[21/9] min-h-[200px] overflow-hidden bg-mist md:min-h-[280px]">
        <Image
          src="https://images.unsplash.com/photo-1467043237213-65f2da53396f?auto=format&fit=crop&w=1600&q=85"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-e from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-y-0 start-0 flex max-w-md flex-col justify-end p-6 md:p-10">
          <p className="font-display text-3xl text-white md:text-4xl">
            {tn("ثلاث نقرات لإطلالة", "A look in three taps")}
          </p>
          <p className="mt-2 text-sm text-white/80">
            {tn(
              "ميزانيتك + المناسبة + اللون — ونبني لك من الكتالوج.",
              "Budget + occasion + color — we build from the catalog.",
            )}
          </p>
          <Link
            href="/style?tool=budget"
            className="mt-4 inline-flex h-10 w-fit items-center bg-sand px-5 text-xs tracking-wide text-ink ring-1 ring-border/60"
          >
            {t("budgetTool")}
          </Link>
        </div>
      </section>

      {/* Premium edit */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink md:text-3xl">
              {tn("مختارات فاخرة", "Premium edit")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tn("قطع بتركيز على الخامة والقصة", "Pieces focused on fabric and cut")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {(premium.length ? premium : PRODUCTS.slice(0, 4)).map((p) => (
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
        <div className="h-scroll flex gap-6 border-y border-border/50 py-4 text-sm text-muted-foreground">
          {SELLERS.map((s) => (
            <span key={s.id} className="shrink-0 font-medium tracking-wide text-ink">
              {tn(s.nameAr, s.nameEn)}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {indie.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Occasion collections */}
      <section className="atmosphere-panel border border-border/50 px-5 py-8 md:px-8">
        <h2 className="font-display text-2xl text-ink md:text-3xl">
          {tn("مجموعات الموسم", "Seasonal collections")}
        </h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          {tn(
            "جامعة، عمل خفيف، مقهى، سفر — إطلالات جاهزة للمناخ السعودي.",
            "Campus, soft work, café, travel — looks tuned for Saudi climate.",
          )}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(
            [
              ["جامعة", "Campus", women[0]?.images[0]],
              ["عمل خفيف", "Soft work", premium[0]?.images[0] ?? PRODUCTS[12].images[0]],
              ["مقهى", "Café", PRODUCTS[0].images[0]],
              ["سفر", "Travel", PRODUCTS[2].images[0]],
            ] as const
          ).map(([ar, en, image], i) => (
            <Link
              key={ar}
              href="/style?tool=budget"
              className="group relative aspect-[4/5] overflow-hidden bg-mist"
            >
              {image && (
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  sizes="200px"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="absolute inset-x-0 bottom-0 p-3 font-display text-lg text-white">
                {tn(ar, en)}
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          {tn("أسعار من", "From")} {formatSar(99, locale)}
        </p>
      </section>

      {/* Split rails */}
      <section className="grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl text-ink md:text-2xl">
              {tn("للنساء", "For her")}
            </h2>
            <Link href="/products?filter=women" className="text-xs text-olive">
              {t("seeAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {women.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-xl text-ink md:text-2xl">
              {tn("للرجال", "For him")}
            </h2>
            <Link href="/products?filter=men" className="text-xs text-olive">
              {t("seeAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {men.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Style hub CTA strip */}
      <section className="border border-border/50 bg-primary px-5 py-8 text-primary-foreground md:px-8">
        <p className="font-display text-3xl tracking-tight md:text-4xl">
          {tn("مركز الستايل", "Style hub")}
        </p>
        <p className="mt-2 max-w-md text-sm text-primary-foreground/75">
          {tn(
            "ماذا يلبس مع هذا · أكمل الإطلالة · مساعد الميزانية · باحث الألوان",
            "What goes with this · Complete the look · Budget · Color finder",
          )}
        </p>
        <Link
          href="/style"
          className="pressable mt-5 inline-flex h-11 items-center bg-sand px-5 text-[11px] tracking-[0.14em] text-ink ring-1 ring-border/50"
        >
          {t("ctaStyle")}
        </Link>
      </section>
    </div>
  );
}
