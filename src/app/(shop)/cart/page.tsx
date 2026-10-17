"use client";

import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatSar, getColor, getProduct } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { t, tn, locale } = useI18n();
  const { lines, parcels, remove, subtotal, deliveryTotal, grandTotal } =
    useCart();
  const router = useRouter();

  if (lines.length === 0) {
    return (
      <EmptyState
        title={t("cartEmpty")}
        hint={t("cartEmptyHint")}
        actionLabel={t("ctaShop")}
        onAction={() => router.push("/home")}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <h1 className="font-display text-3xl text-ink">{t("navCart")}</h1>

      <section className="space-y-5">
        <h2 className="text-sm font-medium text-muted-foreground">{t("parcels")}</h2>
        {parcels.map((parcel) => (
          <div
            key={parcel.sellerId}
            className="atmosphere-panel space-y-3 border border-border/50 p-4"
          >
            <p className="text-sm font-medium">
              {tn(parcel.sellerNameAr, parcel.sellerNameEn)}
            </p>
            {parcel.lines.map((line) => {
              const p = getProduct(line.productId)!;
              const color = getColor(line.colorId);
              return (
                <div key={`${line.productId}-${line.size}`} className="flex gap-3">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-mist">
                    <Image
                      src={p.images[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {tn(p.titleAr, p.titleEn)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {color ? tn(color.ar, color.en) : ""} · {line.size} · ×
                      {line.qty}
                    </p>
                    <p className="mt-1 text-sm">
                      {formatSar(p.price * line.qty, locale)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => remove(line.productId, line.size)}
                  >
                    {tn("حذف", "Remove")}
                  </button>
                </div>
              );
            })}
            <Separator />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{tn("رسوم التوصيل لهذا البائع", "Delivery for this seller")}</span>
              <span>{formatSar(parcel.deliveryFee, locale)}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>{tn("المجموع الفرعي", "Subtotal")}</span>
          <span>{formatSar(subtotal, locale)}</span>
        </div>
        <div className="flex justify-between">
          <span>{tn("التوصيل", "Delivery")}</span>
          <span>{formatSar(deliveryTotal, locale)}</span>
        </div>
        <div className="flex justify-between text-base font-medium">
          <span>{tn("الإجمالي", "Total")}</span>
          <span>{formatSar(grandTotal, locale)}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("vat")}</p>
      </section>

      <Link
        href="/checkout"
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        {t("checkout")}
      </Link>
    </div>
  );
}
