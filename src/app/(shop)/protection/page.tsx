"use client";

import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function BuyerProtectionPage() {
  const { tn } = useI18n();
  const items = [
    {
      ar: "تتبع واضح لكل طرد وبائع",
      en: "Clear tracking per parcel and seller",
    },
    {
      ar: "إرجاع خلال ٧ أيام لأسباب المقاس أو اللون أو العيب",
      en: "Returns within 7 days for size, color, or defect",
    },
    {
      ar: "تأكيد الطلب برمز الجوال قبل تثبيت الدفع عند الاستلام",
      en: "Phone confirmation before locking cash-on-delivery orders",
    },
    {
      ar: "تصعيد للنزاع إذا تأخر البائع عن الموعد",
      en: "Dispute escalation if a seller misses a deadline",
    },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <p className="text-xs tracking-[0.2em] uppercase text-champagne">
          {tn("ثقة", "Trust")}
        </p>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          {tn("حماية المشتري", "Buyer protection")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tn(
            "وعود ظاهرة قبل الشراء — كما في مواصفة تنسيق. التفاصيل القانونية النهائية تُثبَّت مع الكيان.",
            "Visible promises before purchase — per the Tansiq spec. Final legal copy lands with the entity.",
          )}
        </p>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.en}
            className="border border-border/60 bg-white/70 px-4 py-3 text-sm text-ink"
          >
            {tn(item.ar, item.en)}
          </li>
        ))}
      </ul>
      <Link href="/home" className="inline-flex text-sm text-olive underline-offset-4 hover:underline">
        {tn("العودة للتسوق", "Back to shopping")}
      </Link>
    </div>
  );
}
