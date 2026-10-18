"use client";

import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useEffect, useState } from "react";

type Config = {
  legalEntityName: string;
  legalCr: string;
  legalLicense: string;
  legalCapital: string;
  legalStatus: string;
  pilotCity: string;
  codOwner: string;
  supportEmail: string;
  supportPhone: string;
  appVersion: string;
};

export default function LegalPage() {
  const { tn } = useI18n();
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    void fetch("/api/pilot/config")
      .then((r) => r.json())
      .then((d) => setConfig(d.config))
      .catch(() => setConfig(null));
  }, []);

  const pending = !config || config.legalStatus !== "ready";

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-10">
      <div>
        <p className="text-xs tracking-[0.2em] uppercase text-champagne">
          {tn("قانوني", "Legal")}
        </p>
        <h1 className="font-display text-3xl text-ink">
          {tn("السياسات والهوية", "Policies & identity")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tn(
            "مسودة جاهزة للإطلاق التجريبي — النصوص النهائية تُثبَّت بعد اعتماد Via Consulting.",
            "Pilot-ready draft — final copy locks after Via Consulting sign-off.",
          )}
        </p>
      </div>

      <section className="atmosphere-panel space-y-2 border border-border/50 p-5 text-sm">
        <h2 className="font-display text-xl text-ink">
          {tn("الهوية القانونية", "Legal identity")}
        </h2>
        {pending && (
          <p className="rounded-sm bg-accent/80 px-3 py-2 text-xs text-ink">
            {tn(
              "حالة: بانتظار تأكيد Via — لا تُعرض أرقام نهائية للمستهلك بعد.",
              "Status: awaiting Via confirmation — no final consumer-facing numbers yet.",
            )}
          </p>
        )}
        <dl className="space-y-2 text-muted-foreground">
          <div>
            <dt className="text-ink">{tn("الكيان", "Entity")}</dt>
            <dd>{config?.legalEntityName ?? "…"}</dd>
          </div>
          <div>
            <dt className="text-ink">{tn("السجل التجاري", "Commercial registration")}</dt>
            <dd dir="ltr">{config?.legalCr ?? "…"}</dd>
          </div>
          <div>
            <dt className="text-ink">{tn("الترخيص", "License")}</dt>
            <dd>{config?.legalLicense ?? "…"}</dd>
          </div>
          <div>
            <dt className="text-ink">{tn("رأس المال", "Capital")}</dt>
            <dd>{config?.legalCapital ?? "…"}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="font-display text-xl text-ink">
          {tn("شروط الاستخدام (مسودة)", "Terms of use (draft)")}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {tn(
            "تنسيق سوق وسيط يعرض منتجات بائعين مستقلين. الطلبات تُدفع عند الاستلام في مدينة الإطلاق التجريبية. يحق للمشتري الإرجاع خلال ٧ أيام وفق سياسة الإرجاع.",
            "Tansiq is a marketplace that lists independent sellers. Pilot orders use cash on delivery in the launch city. Buyers may return within 7 days under the returns policy.",
          )}
        </p>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="font-display text-xl text-ink">
          {tn("الخصوصية (مسودة)", "Privacy (draft)")}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {tn(
            "نجمع رقم الجوال وعنوان التوصيل لإتمام الطلبات وتتبعها. لا نبيع بياناتك. قنوات الدعم قد تشمل واتساب وتذاكر داخلية.",
            "We collect phone and delivery address to fulfill and track orders. We do not sell your data. Support may include WhatsApp and in-app tickets.",
          )}
        </p>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="font-display text-xl text-ink">
          {tn("الإطلاق التجريبي", "Pilot launch")}
        </h2>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>
            {tn("المدينة", "City")}: {config?.pilotCity ?? "…"}
          </li>
          <li>
            {tn("مسؤول COD", "COD owner")}: {config?.codOwner ?? "…"}
          </li>
          <li dir="ltr">
            {config?.supportEmail} · {config?.supportPhone}
          </li>
          <li>
            {tn("الإصدار", "Version")}: {config?.appVersion ?? "…"}
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/protection" className="text-olive underline-offset-4 hover:underline">
          {tn("حماية المشتري", "Buyer protection")}
        </Link>
        <Link href="/returns" className="text-olive underline-offset-4 hover:underline">
          {tn("الإرجاع", "Returns")}
        </Link>
        <Link href="/pilot" className="text-muted-foreground underline-offset-4 hover:underline">
          {tn("جاهزية الإطلاق", "Pilot readiness")}
        </Link>
      </div>
    </div>
  );
}
