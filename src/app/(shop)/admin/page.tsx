"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

type Report = {
  id: string;
  type: string;
  targetId: string;
  reason: string;
  status: string;
};

type SellerRow = {
  id: string;
  nameEn: string;
  nameAr: string;
  status: string;
};

export default function AdminPage() {
  const { tn } = useI18n();
  const [reports, setReports] = useState<Report[]>([]);
  const [pending, setPending] = useState<SellerRow[]>([]);

  const load = async () => {
    const res = await fetch("/api/admin/reports");
    const data = await res.json();
    setReports(data.reports || []);
    setPending(data.pendingSellers || []);
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">
          {tn("إدارة", "Admin")}
        </p>
        <h1 className="font-display text-3xl text-ink">
          {tn("اعتدال ومراجعة", "Moderation")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tn(
            "مرحلة 1: هيكل تشغيل — الموافقات تُحفظ في قاعدة البيانات.",
            "Phase 1 shell — approvals persist in the database.",
          )}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl">{tn("بائعون بانتظار الموافقة", "Pending sellers")}</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {tn("لا يوجد بانتظار — البذرة وافقت البائعين الحاليين", "None pending — seed approved current sellers")}
          </p>
        ) : (
          pending.map((s) => (
            <div key={s.id} className="flex items-center justify-between border border-border/60 bg-sand/80 px-3 py-2 text-sm">
              <span>{tn(s.nameAr, s.nameEn)}</span>
              <Button
                size="sm"
                className="rounded-none"
                onClick={async () => {
                  await fetch("/api/admin/reports", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sellerId: s.id, status: "approved" }),
                  });
                  await load();
                }}
              >
                {tn("موافقة", "Approve")}
              </Button>
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">{tn("بلاغات", "Reports")}</h2>
        {reports.map((r) => (
          <div key={r.id} className="space-y-2 border border-border/60 bg-sand/80 p-3 text-sm">
            <p className="font-medium">
              {r.type} · {r.targetId}
            </p>
            <p className="text-muted-foreground">{r.reason}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs">{r.status}</span>
              {r.status === "open" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none"
                  onClick={async () => {
                    await fetch("/api/admin/reports", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ reportId: r.id, status: "resolved" }),
                    });
                    await load();
                  }}
                >
                  {tn("حل", "Resolve")}
                </Button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
