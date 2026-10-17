"use client";

import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export function SiteFooter() {
  const { tn } = useI18n();
  return (
    <footer className="mt-12 border-t border-border/60 bg-sand/60 px-4 py-8 text-xs text-muted-foreground">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-ink">{tn("تنسيق", "Tansiq")}</p>
          <p className="mt-2 leading-relaxed">
            {tn(
              "الأسلوب أولًا، ثم التسوق — سوق كاجوال يومي للسعودية.",
              "Style first, then shop — everyday casual marketplace for Saudi Arabia.",
            )}
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-ink">{tn("الثقة", "Trust")}</p>
          <Link href="/protection" className="block hover:text-ink">
            {tn("حماية المشتري", "Buyer protection")}
          </Link>
          <Link href="/returns" className="block hover:text-ink">
            {tn("الإرجاع", "Returns")}
          </Link>
          <Link href="/account" className="block hover:text-ink">
            {tn("الحساب والدعم", "Account & support")}
          </Link>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-ink">{tn("الهوية القانونية", "Legal identity")}</p>
          <p>
            {tn(
              "قيد التأكيد مع Via Consulting — رقم السجل / مرخص / رأس المال يظهر هنا عند الإطلاق.",
              "Pending Via Consulting confirmation — CR / license / capital appear here at launch.",
            )}
          </p>
          <p dir="ltr">support@tansiq.example · +966 00 000 0000</p>
        </div>
      </div>
    </footer>
  );
}
