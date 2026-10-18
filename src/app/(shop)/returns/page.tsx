"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const REASONS = [
  { id: "size", ar: "المقاس", en: "Size" },
  { id: "color", ar: "اللون مختلف عن الصورة", en: "Color not as shown" },
  { id: "defect", ar: "عيب تصنيع", en: "Defect" },
  { id: "mind", ar: "غيّرت رأيي", en: "Changed mind" },
];

type ParcelOpt = {
  sellerId: string;
  nameAr: string;
  nameEn: string;
};

function ReturnsInner() {
  const { t, tn } = useI18n();
  const params = useSearchParams();
  const orderId = params.get("order") ?? "";
  const sellerParam = params.get("seller") ?? "";
  const [reason, setReason] = useState("size");
  const [notes, setNotes] = useState("");
  const [sellerId, setSellerId] = useState(sellerParam);
  const [parcels, setParcels] = useState<ParcelOpt[]>([]);
  const [returnId, setReturnId] = useState<string | null>(null);
  const [refundStatus, setRefundStatus] = useState("pending");
  const [deadline, setDeadline] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderInput, setOrderInput] = useState(orderId);

  useEffect(() => {
    if (!orderId) return;
    void (async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok) return;
      const opts: ParcelOpt[] = (data.order.parcels || []).map(
        (p: {
          sellerId: string;
          seller: { nameAr: string; nameEn: string };
        }) => ({
          sellerId: p.sellerId,
          nameAr: p.seller.nameAr,
          nameEn: p.seller.nameEn,
        }),
      );
      setParcels(opts);
      if (!sellerId && opts[0]) setSellerId(opts[0].sellerId);
    })();
  }, [orderId, sellerId]);

  if (returnId) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <p className="font-display text-3xl">
          {tn("طلب الإرجاع مفتوح", "Return opened")}
        </p>
        <p className="text-sm text-muted-foreground">
          {tn("حالة الاسترداد", "Refund status")}:{" "}
          <span className="font-medium text-ink">{refundStatus}</span>
        </p>
        {deadline && (
          <p className="text-xs text-muted-foreground">
            {tn("موعد البائع", "Seller deadline")}:{" "}
            {new Date(deadline).toLocaleDateString()}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href={`/orders/${orderInput || orderId}`}
            className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm text-primary-foreground"
          >
            {t("track")}
          </Link>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={async () => {
              await fetch("/api/disputes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: orderInput || orderId,
                  returnId,
                  type: "return_sla",
                  reason: "Seller missed return deadline / unresolved refund",
                }),
              });
            }}
          >
            {tn("تصعيد نزاع", "Escalate dispute")}
          </Button>
        </div>
      </div>
    );
  }

  const submit = async () => {
    const oid = (orderInput || orderId).trim();
    if (!oid || !sellerId) {
      setError(tn("اختر الطلب والبائع", "Pick order and seller"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: oid,
          sellerId,
          reason,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReturnId(data.return.id);
      setRefundStatus(data.return.refundStatus);
      setDeadline(data.return.deadlineAt);
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("returns")}</h1>
        <p className="text-sm text-muted-foreground">
          {tn("خلال ٧ أيام من الاستلام — الحالة تُحفظ في قاعدة البيانات", "Within 7 days of delivery — status saved in the database")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">{tn("رقم الطلب", "Order id")}</Label>
        <input
          id="order"
          value={orderInput}
          onChange={(e) => setOrderInput(e.target.value)}
          className="flex h-10 w-full border border-border bg-sand/80 px-3 text-sm"
          dir="ltr"
          placeholder="TQ-xxxxx"
        />
      </div>

      {parcels.length > 0 && (
        <div className="space-y-2">
          <Label>{tn("البائع / الطرد", "Seller / parcel")}</Label>
          <div className="flex flex-wrap gap-2">
            {parcels.map((p) => (
              <button
                key={p.sellerId}
                type="button"
                onClick={() => setSellerId(p.sellerId)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm",
                  sellerId === p.sellerId
                    ? "bg-olive text-primary-foreground"
                    : "border border-border",
                )}
              >
                {tn(p.nameAr, p.nameEn)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>{tn("سبب الإرجاع", "Return reason")}</Label>
        <div className="flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setReason(r.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                reason === r.id
                  ? "bg-olive text-primary-foreground"
                  : "border border-border",
              )}
            >
              {tn(r.ar, r.en)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{tn("ملاحظات (اختياري)", "Notes (optional)")}</Label>
        <Textarea
          id="notes"
          rows={3}
          className="resize-none bg-sand/60"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full rounded-full"
        disabled={submitting}
        onClick={() => void submit()}
      >
        {submitting
          ? tn("جاري الحفظ…", "Saving…")
          : tn("أرسل طلب الإرجاع", "Submit return")}
      </Button>
    </div>
  );
}

export default function ReturnsPage() {
  return (
    <Suspense>
      <ReturnsInner />
    </Suspense>
  );
}
