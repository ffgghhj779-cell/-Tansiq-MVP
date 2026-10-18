"use client";

import { Progress } from "@/components/ui/progress";
import { formatSar } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import type { OrderStatus } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

type DbOrder = {
  id: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  shortAddress: string;
  nationalAddress: string;
  payment: string;
  status: string;
  total: number;
  otpVerified: boolean;
  confirmedAt: string | null;
  createdAt: string;
  notifications?: { id: string; channel: string; body: string; status: string }[];
  returnRequests?: {
    id: string;
    reason: string;
    status: string;
    refundStatus: string;
    deadlineAt: string;
    seller: { nameAr: string; nameEn: string };
  }[];
  parcels: {
    id: string;
    sellerId: string;
    status: string;
    trackingNumber: string;
    deliveryFee: number;
    etaAr: string;
    etaEn: string;
    seller: { nameAr: string; nameEn: string };
    items: {
      id: string;
      productId: string;
      size: string;
      qty: number;
      unitPrice: number;
      product: {
        titleAr: string;
        titleEn: string;
        imagesJson: string;
      };
    }[];
  }[];
};

function parseImages(json: string): string[] {
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
}

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { t, tn, locale } = useI18n();
  const [order, setOrder] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Not found");
        if (!cancelled) setOrder(data.order);
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center text-sm text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg space-y-3 py-16 text-center">
        <p className="text-sm text-destructive">{error || t("error")}</p>
        <Link href="/orders" className="text-sm underline">
          {t("orders")}
        </Link>
      </div>
    );
  }

  const addressBits = [
    order.city,
    order.district,
    order.shortAddress,
    order.nationalAddress,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <p className="text-sm text-muted-foreground">{t("orders")}</p>
        <h1 className="font-display text-3xl text-ink">{order.id}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("cod")} · {formatSar(order.total, locale)}
          {order.otpVerified
            ? ` · ${tn("موثّق", "Verified")}`
            : ""}
        </p>
        {addressBits.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {addressBits.join(" · ")}
          </p>
        )}
        {order.address && (
          <p className="text-xs text-muted-foreground">{order.address}</p>
        )}
      </div>

      {order.notifications && order.notifications.length > 0 && (
        <section className="atmosphere-panel space-y-2 border border-border/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {tn("إشعارات", "Notifications")}
          </p>
          {order.notifications.map((n) => (
            <p key={n.id} className="text-xs text-muted-foreground">
              <span className="font-medium text-ink">{n.channel}</span>
              {" · "}
              {n.status}
              {" — "}
              {n.body}
            </p>
          ))}
        </section>
      )}

      {order.returnRequests && order.returnRequests.length > 0 && (
        <section className="atmosphere-panel space-y-2 border border-border/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {tn("إرجاع", "Returns")}
          </p>
          {order.returnRequests.map((r) => (
            <p key={r.id} className="text-xs text-muted-foreground">
              <span className="font-medium text-ink">
                {tn(r.seller.nameAr, r.seller.nameEn)}
              </span>
              {" · "}
              {r.reason} · {r.status} · {tn("استرداد", "refund")}: {r.refundStatus}
            </p>
          ))}
        </section>
      )}

      {order.parcels.map((parcel) => {
        const status = (STEPS.includes(parcel.status as OrderStatus)
          ? parcel.status
          : "placed") as OrderStatus;
        const stepIndex = STEPS.indexOf(status);
        const progress = ((stepIndex + 1) / STEPS.length) * 100;
        return (
          <section
            key={parcel.id}
            className="atmosphere-panel space-y-4 border border-border/50 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {tn(parcel.seller.nameAr, parcel.seller.nameEn)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tn("الموعد", "ETA")}: {tn(parcel.etaAr, parcel.etaEn)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {parcel.trackingNumber || "—"}
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
            <div className="space-y-2">
              {parcel.items.map((item) => {
                const images = parseImages(item.product.imagesJson);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-mist">
                      {images[0] && (
                        <Image
                          src={images[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {tn(item.product.titleAr, item.product.titleEn)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} · ×{item.qty} ·{" "}
                        {formatSar(item.unitPrice * item.qty, locale)}
                      </p>
                    </div>
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
