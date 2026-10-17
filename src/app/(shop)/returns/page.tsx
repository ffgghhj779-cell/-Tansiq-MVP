"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const REASONS = [
  { id: "size", ar: "المقاس", en: "Size" },
  { id: "color", ar: "اللون مختلف عن الصورة", en: "Color not as shown" },
  { id: "defect", ar: "عيب تصنيع", en: "Defect" },
  { id: "mind", ar: "غيّرت رأيي", en: "Changed mind" },
];

function ReturnsInner() {
  const { t, tn } = useI18n();
  const params = useSearchParams();
  const orderId = params.get("order") ?? "TQ-10482";
  const [reason, setReason] = useState("size");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <p className="font-display text-3xl">{tn("طلب الإرجاع مفتوح", "Return opened")}</p>
        <p className="text-sm text-muted-foreground">
          {tn(
            "الموعد النهائي ظاهر للبائع. يمكنك متابعة الحالة من الطلبات.",
            "Deadline is visible to the seller. Track status from orders.",
          )}
        </p>
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm text-primary-foreground"
        >
          {t("track")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("returns")}</h1>
        <p className="text-sm text-muted-foreground">
          {tn("طلب", "Order")} {orderId} · {tn("خلال ٧ أيام من الاستلام", "Within 7 days of delivery")}
        </p>
      </div>

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
        <Textarea id="notes" rows={3} className="resize-none" />
      </div>

      <p className="text-xs text-muted-foreground">
        {tn(
          "صور اختيارية في الإصدار الكامل. الاسترداد يظهر حالته بعد موافقة البائع.",
          "Optional photos in the full release. Refund status shows after seller approval.",
        )}
      </p>

      <Button className="w-full rounded-full" onClick={() => setDone(true)}>
        {tn("أرسل طلب الإرجاع", "Submit return")}
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
