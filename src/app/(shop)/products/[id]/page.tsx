"use client";

import { ProductCard } from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatSar,
  getColor,
  getProduct,
  getSeller,
  WEAR_WITH,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProduct(id);
  const { t, tn, locale } = useI18n();
  const { add } = useCart();
  const router = useRouter();
  const [imageIdx, setImageIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [colorId, setColorId] = useState(product?.colors[0] ?? "");
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="py-16 text-center">
        <p>{tn("المنتج غير موجود", "Product not found")}</p>
        <Link
          href="/products"
          className="mt-4 inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm text-primary-foreground"
        >
          {tn("العودة", "Back")}
        </Link>
      </div>
    );
  }

  const seller = getSeller(product.sellerId)!;
  const wear = WEAR_WITH[product.id] ?? [];
  const recommended = product.sizes[1] ?? product.sizes[0];

  const handleAdd = () => {
    const chosen = size ?? recommended;
    add({ productId: product.id, size: chosen, colorId });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="pb-28">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden bg-mist product-shadow">
            <Image
              src={product.images[imageIdx]}
              alt={tn(product.titleAr, product.titleEn)}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="mt-3 flex gap-2">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setImageIdx(i)}
                className={cn(
                  "relative h-16 w-14 overflow-hidden border-2",
                  imageIdx === i ? "border-olive" : "border-transparent",
                )}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">
              {tn(seller.nameAr, seller.nameEn)} · {tn(seller.cityAr, seller.cityEn)}
            </p>
            <h1 className="mt-1 font-display text-3xl text-ink md:text-4xl">
              {tn(product.titleAr, product.titleEn)}
            </h1>
            <p className="mt-2 text-xl font-medium">
              {formatSar(product.price, locale)}
              <span className="ms-2 text-xs font-normal text-muted-foreground">
                {t("vat")}
              </span>
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">{tn("اللون", "Color")}</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => {
                const color = getColor(c)!;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColorId(c)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                      colorId === c ? "border-olive bg-accent" : "border-border",
                    )}
                  >
                    <span
                      className="size-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                    {tn(color.ar, color.en)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-medium">{tn("المقاس", "Size")}</p>
              <Badge variant="secondary" className="rounded-full text-[10px]">
                {t("sizeRec")}: {recommended}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-11 rounded-full border px-3 py-2 text-sm",
                    (size ?? recommended) === s
                      ? "border-olive bg-olive text-primary-foreground"
                      : "border-border bg-card/70",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {tn("يميل للمقاس الصحيح حسب بيانات الموديل.", "Fits true based on model data.")}
              {product.modelHeight &&
                ` · ${tn("الموديل", "Model")} ${product.modelHeight} / ${product.modelSize}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 border-y border-border/60 py-3 text-sm">
            <div>
              <p className="text-muted-foreground">{t("deliveryEta")}</p>
              <p className="font-medium">{tn("٢–٤ أيام", "2–4 days")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("returnWindow")}</p>
              <p className="font-medium">
                {seller.returnDays} {t("days")}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full rounded-full sticky bottom-24 md:static"
            onClick={handleAdd}
          >
            {added ? tn("أُضيفت ✓", "Added ✓") : t("addCart")}
          </Button>

          <section className="space-y-2">
            <h2 className="font-display text-xl">{t("fabricCare")}</h2>
            <div className="flex flex-wrap gap-2">
              {product.fabricChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {tn(product.fabricAr, product.fabricEn)} ·{" "}
              {tn(
                "مناسب لحر الرياض مع تكييف داخلي.",
                "Suited to Riyadh heat with indoor AC.",
              )}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl">{t("sellerTrust")}</h2>
            <p className="text-sm">
              {tn(seller.nameAr, seller.nameEn)} — ★ {seller.rating} ·{" "}
              {tn("درجة التوصيل", "Delivery score")} {seller.deliveryScore}%
            </p>
          </section>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {tn(product.descriptionAr, product.descriptionEn)}
          </p>
        </div>
      </div>

      {wear.length > 0 && (
        <section className="mt-10 space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl">{t("wearWith")}</h2>
            <Link href="/style?tool=complete" className="text-sm text-olive underline-offset-4 hover:underline">
              {t("completeLook")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {wear.map((m) => {
              const p = getProduct(m.productId)!;
              return (
                <div key={m.productId} className="space-y-2">
                  <ProductCard product={p} />
                  <p className="text-xs text-muted-foreground">
                    {tn(m.reasonAr, m.reasonEn)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border/70 bg-[#f3f1ec]/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl gap-2">
          <Button className="flex-1 rounded-full" onClick={handleAdd}>
            {t("addCart")}
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => {
              handleAdd();
              router.push("/cart");
            }}
          >
            {t("checkout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
