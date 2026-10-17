"use client";

import { Progress } from "@/components/ui/progress";
import {
  SAMPLE_ORDERS,
  formatSar,
  getProduct,
  getSeller,
} from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import type { OrderStatus } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const STEPS: OrderStatus[] = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const STEP_LABELS: Record<OrderStatus, { ar: string; en: string }> = {
  placed: { ar: "استُلم الطلب", en: "Placed" },
  confirmed: { ar: "تأكيد", en: "Confirmed" },
  packed: { ar: "تجهيز", en: "Packed" },
  shipped: { ar: "شُحن", en: "Shipped" },
  out_for_delivery: { ar: "خرج للتسليم", en: "Out for delivery" },
  delivered: { ar: "تم التسليم", en: "Delivered" },
};

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { t, tn, locale } = useI18n();
  const order = SAMPLE_ORDERS.find((o) => o.id === id) ?? SAMPLE_ORDERS[0];

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <p className="text-sm text-muted-foreground">{t("orders")}</p>
        <h1 className="font-display text-3xl text-ink">{order.id}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("cod")} · {formatSar(order.total, locale)}
        </p>
      </div>

      {order.parcels.map((parcel) => {
        const seller = getSeller(parcel.sellerId)!;
        const stepIndex = STEPS.indexOf(parcel.status);
        const progress = ((stepIndex + 1) / STEPS.length) * 100;
        return (
          <section
            key={parcel.sellerId}
            className="atmosphere-panel space-y-4 border border-border/50 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{tn(seller.nameAr, seller.nameEn)}</p>
                <p className="text-xs text-muted-foreground">
                  {tn("الموعد", "ETA")}: {tn(parcel.etaAr, parcel.etaEn)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {parcel.trackingNumber}
              </p>
            </div>
            <Progress value={progress} className="h-1.5" />
            <ol className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground sm:grid-cols-6">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className={i <= stepIndex ? "font-medium text-olive" : ""}
                >
                  {tn(STEP_LABELS[s].ar, STEP_LABELS[s].en)}
                </li>
              ))}
            </ol>
            <div className="flex gap-2 overflow-x-auto">
              {parcel.productIds.map((pid) => {
                const p = getProduct(pid)!;
                return (
                  <div key={pid} className="relative h-16 w-12 shrink-0 overflow-hidden bg-mist">
                    <Image src={p.images[0]} alt="" fill className="object-cover" sizes="48px" />
                  </div>
                );
              })}
            </div>
            <Link
              href={`/returns?order=${order.id}&seller=${parcel.sellerId}`}
              className="inline-flex h-7 items-center justify-center rounded-full border border-border px-3 text-sm hover:bg-muted"
            >
              {t("returns")}
            </Link>
          </section>
        );
      })}
    </div>
  );
}
