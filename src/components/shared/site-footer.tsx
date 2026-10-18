"use client";

import { BrandLockup } from "@/components/brand/brand-lockup";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useEffect, useState } from "react";

type FooterConfig = {
  pilotCity: string;
  legalEntityName: string;
  legalCr: string;
  legalStatus: string;
  supportEmail: string;
  supportPhone: string;
  appVersion: string;
  codOwner: string;
};

export function SiteFooter() {
  const { tn } = useI18n();
  const [config, setConfig] = useState<FooterConfig | null>(null);

  useEffect(() => {
    void fetch("/api/pilot/config")
      .then((r) => r.json())
      .then((d) => setConfig(d.config))
      .catch(() => setConfig(null));
  }, []);

  return (
    <footer className="mt-10 border-t border-border/60 bg-sand/60 px-4 pb-4 pt-8 text-xs text-muted-foreground md:mt-14">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        <div>
          <BrandLockup href="/" size="sm" showSlogan mark="svg" />
          <p className="mt-3 leading-relaxed">
            {tn(
              "سوق كاجوال يومي للسعودية — لون وقماش ومقاس بثقة.",
              "Everyday casual marketplace for Saudi Arabia — color, fabric, and fit with confidence.",
            )}
          </p>
          {config && (
            <p className="mt-2 text-[10px] tracking-wide">
              {tn("إطلاق تجريبي", "Pilot")}: {config.pilotCity} · v
              {config.appVersion}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <p className="font-medium text-ink">{tn("الثقة", "Trust")}</p>
          <Link href="/protection" className="block hover:text-ink">
            {tn("حماية المشتري", "Buyer protection")}
          </Link>
          <Link href="/returns" className="block hover:text-ink">
            {tn("الإرجاع", "Returns")}
          </Link>
          <Link href="/legal" className="block hover:text-ink">
            {tn("قانوني وسياسات", "Legal & policies")}
          </Link>
          <Link href="/account" className="block hover:text-ink">
            {tn("الحساب والدعم", "Account & support")}
          </Link>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-ink">{tn("الهوية القانونية", "Legal identity")}</p>
          {config ? (
            <>
              <p>{config.legalEntityName}</p>
              <p dir="ltr">{config.legalCr}</p>
              {config.legalStatus !== "ready" && (
                <p className="text-[10px]">
                  {tn(
                    "بانتظار تأكيد Via Consulting",
                    "Awaiting Via Consulting confirmation",
                  )}
                </p>
              )}
              <p dir="ltr">
                {config.supportEmail} · {config.supportPhone}
              </p>
              <p className="text-[10px]">
                COD: {config.codOwner}
              </p>
            </>
          ) : (
            <p>
              {tn(
                "قيد التأكيد مع Via Consulting — رقم السجل / مرخص / رأس المال يظهر هنا عند الإطلاق.",
                "Pending Via Consulting confirmation — CR / license / capital appear here at launch.",
              )}
            </p>
          )}
          <Link href="/pilot" className="block text-olive hover:underline">
            {tn("جاهزية الإطلاق", "Pilot readiness")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
