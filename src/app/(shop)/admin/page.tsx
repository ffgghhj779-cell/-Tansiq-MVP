"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

type Tab =
  | "sellers"
  | "reports"
  | "returns"
  | "disputes"
  | "tickets"
  | "sla"
  | "style"
  | "pilot";

type Overview = {
  counts: {
    openReports: number;
    openDisputes: number;
    openReturns: number;
    openTickets: number;
    pendingSellers: number;
  };
  reports: { id: string; type: string; targetId: string; reason: string; status: string }[];
  pendingSellers: { id: string; nameAr: string; nameEn: string; status: string }[];
  sellers: {
    id: string;
    nameAr: string;
    nameEn: string;
    status: string;
    deliveryScore: number;
    slaHours: number;
    onTimeCount: number;
    lateCount: number;
  }[];
  disputes: {
    id: string;
    type: string;
    reason: string;
    status: string;
    order?: { id: string } | null;
  }[];
  returns: {
    id: string;
    reason: string;
    status: string;
    refundStatus: string;
    deadlineAt: string;
    order: { id: string; total: number };
    seller: { nameAr: string; nameEn: string };
  }[];
  tickets: {
    id: string;
    phone: string;
    subject: string;
    body: string;
    status: string;
    channel: string;
  }[];
};

export default function AdminPage() {
  const { tn } = useI18n();
  const [tab, setTab] = useState<Tab>("sellers");
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [styleEnabled, setStyleEnabled] = useState(true);
  const [styleMeta, setStyleMeta] = useState<{
    ruleCounts: { kind: string; _count: number }[];
    feedback: { vote: string; _count: number }[];
  } | null>(null);
  const [pilotHealth, setPilotHealth] = useState<string>("…");
  const [errorCount24h, setErrorCount24h] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/overview");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json);
      const styleRes = await fetch("/api/style/settings");
      const styleJson = await styleRes.json();
      if (styleRes.ok) {
        setStyleEnabled(!!styleJson.enabled);
        setStyleMeta({
          ruleCounts: styleJson.ruleCounts || [],
          feedback: styleJson.feedback || [],
        });
      }
      const [healthRes, errRes] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/errors?limit=5"),
      ]);
      const healthJson = await healthRes.json();
      const errJson = await errRes.json();
      if (healthRes.ok) {
        setPilotHealth(
          `${healthJson.status} · v${healthJson.version} · ${healthJson.pilotCity} · ready=${healthJson.pilotReady}`,
        );
      }
      if (errRes.ok) setErrorCount24h(errJson.last24h || 0);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tabs: { id: Tab; ar: string; en: string; count?: number }[] = [
    {
      id: "sellers",
      ar: "بائعون",
      en: "Sellers",
      count: data?.counts.pendingSellers,
    },
    {
      id: "reports",
      ar: "بلاغات",
      en: "Reports",
      count: data?.counts.openReports,
    },
    {
      id: "returns",
      ar: "إرجاع",
      en: "Returns",
      count: data?.counts.openReturns,
    },
    {
      id: "disputes",
      ar: "نزاعات",
      en: "Disputes",
      count: data?.counts.openDisputes,
    },
    {
      id: "tickets",
      ar: "تذاكر",
      en: "Tickets",
      count: data?.counts.openTickets,
    },
    { id: "sla", ar: "SLA", en: "SLA" },
    { id: "style", ar: "ستايل", en: "Style" },
    { id: "pilot", ar: "إطلاق", en: "Pilot" },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">
          {tn("إدارة", "Admin")}
        </p>
        <h1 className="font-display text-3xl text-ink">
          {tn("ثقة السوق", "Market trust")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tn(
            "مرحلة 3: موافقات، بلاغات، إرجاع، نزاعات، تذاكر ودرجة توصيل.",
            "Phase 3: approvals, reports, returns, disputes, tickets & delivery scores.",
          )}
        </p>
      </div>

      <div className="h-scroll flex gap-2 pb-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs",
              tab === item.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-sand/70",
            )}
          >
            {tn(item.ar, item.en)}
            {typeof item.count === "number" && item.count > 0
              ? ` · ${item.count}`
              : ""}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!data && !error && (
        <p className="text-sm text-muted-foreground">{tn("تحميل…", "Loading…")}</p>
      )}

      {data && tab === "sellers" && (
        <section className="space-y-3">
          <h2 className="font-display text-xl">
            {tn("بائعون بانتظار الموافقة", "Pending sellers")}
          </h2>
          {data.pendingSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tn("لا يوجد بانتظار", "None pending")}
            </p>
          ) : (
            data.pendingSellers.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between border border-border/60 bg-sand/80 px-3 py-2 text-sm"
              >
                <span>{tn(s.nameAr, s.nameEn)}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-none"
                    onClick={async () => {
                      await fetch("/api/admin/reports", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          sellerId: s.id,
                          status: "approved",
                        }),
                      });
                      await load();
                    }}
                  >
                    {tn("موافقة", "Approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none"
                    onClick={async () => {
                      await fetch("/api/admin/reports", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          sellerId: s.id,
                          status: "rejected",
                        }),
                      });
                      await load();
                    }}
                  >
                    {tn("رفض", "Reject")}
                  </Button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {data && tab === "reports" && (
        <section className="space-y-3">
          <h2 className="font-display text-xl">{tn("بلاغات", "Reports")}</h2>
          {data.reports.map((r) => (
            <div
              key={r.id}
              className="space-y-2 border border-border/60 bg-sand/80 p-3 text-sm"
            >
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
                        body: JSON.stringify({
                          reportId: r.id,
                          status: "resolved",
                        }),
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
      )}

      {data && tab === "returns" && (
        <section className="space-y-3">
          <h2 className="font-display text-xl">{tn("طلبات الإرجاع", "Return requests")}</h2>
          {data.returns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tn("لا إرجاع بعد", "No returns yet")}
            </p>
          ) : (
            data.returns.map((r) => (
              <div
                key={r.id}
                className="space-y-2 border border-border/60 bg-sand/80 p-3 text-sm"
              >
                <p className="font-medium">
                  {r.order.id} · {tn(r.seller.nameAr, r.seller.nameEn)}
                </p>
                <p className="text-muted-foreground">
                  {r.reason} · {tn("استرداد", "Refund")}: {r.refundStatus}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tn("موعد", "Deadline")}:{" "}
                  {new Date(r.deadlineAt).toLocaleDateString()} · {r.status}
                </p>
                {r.status === "open" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="rounded-none"
                      onClick={async () => {
                        await fetch("/api/returns", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: r.id,
                            status: "approved",
                            refundStatus: "refunded",
                          }),
                        });
                        await load();
                      }}
                    >
                      {tn("موافق + استرداد", "Approve + refund")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-none"
                      onClick={async () => {
                        await fetch("/api/returns", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: r.id,
                            status: "rejected",
                            refundStatus: "denied",
                          }),
                        });
                        await load();
                      }}
                    >
                      {tn("رفض", "Deny")}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      )}

      {data && tab === "disputes" && (
        <section className="space-y-3">
          <h2 className="font-display text-xl">{tn("نزاعات", "Disputes")}</h2>
          {data.disputes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tn("لا نزاعات مفتوحة", "No disputes")}
            </p>
          ) : (
            data.disputes.map((d) => (
              <div
                key={d.id}
                className="space-y-2 border border-border/60 bg-sand/80 p-3 text-sm"
              >
                <p className="font-medium">
                  {d.type}
                  {d.order ? ` · ${d.order.id}` : ""}
                </p>
                <p className="text-muted-foreground">{d.reason}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs">{d.status}</span>
                  {d.status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-none"
                      onClick={async () => {
                        await fetch("/api/disputes", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: d.id,
                            status: "resolved",
                          }),
                        });
                        await load();
                      }}
                    >
                      {tn("إغلاق", "Resolve")}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {data && tab === "tickets" && (
        <section className="space-y-3">
          <h2 className="font-display text-xl">
            {tn("تذاكر الدعم", "Support tickets")}
          </h2>
          {data.tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tn("لا تذاكر", "No tickets")}
            </p>
          ) : (
            data.tickets.map((tkt) => (
              <div
                key={tkt.id}
                className="space-y-2 border border-border/60 bg-sand/80 p-3 text-sm"
              >
                <p className="font-medium">{tkt.subject}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {tkt.phone} · {tkt.channel}
                </p>
                <p className="text-muted-foreground">{tkt.body}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs">{tkt.status}</span>
                  {tkt.status === "open" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-none"
                      onClick={async () => {
                        await fetch("/api/tickets", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: tkt.id,
                            status: "closed",
                          }),
                        });
                        await load();
                      }}
                    >
                      {tn("إغلاق", "Close")}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {data && tab === "sla" && (
        <section className="space-y-3">
          <h2 className="font-display text-xl">
            {tn("درجة التوصيل / SLA", "Delivery score / SLA")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {tn(
              "تُحدَّث عند تعليم الطرد كمُسلَّم مقارنة بساعات SLA للبائع.",
              "Updates when a parcel is marked delivered vs the seller’s SLA hours.",
            )}
          </p>
          {data.sellers.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border border-border/60 bg-sand/80 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{tn(s.nameAr, s.nameEn)}</p>
                <p className="text-xs text-muted-foreground">
                  SLA {s.slaHours}h · on-time {s.onTimeCount} · late {s.lateCount} ·{" "}
                  {s.status}
                </p>
              </div>
              <p className="font-display text-xl text-olive">{s.deliveryScore}%</p>
            </div>
          ))}
        </section>
      )}

      {tab === "style" && (
        <section className="space-y-4">
          <h2 className="font-display text-xl">
            {tn("محرك الستايل", "Style engine")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {tn(
              "إيقاف المحرك يخفي الاقتراحات في مركز الستايل فورًا.",
              "Disabling the engine hides Style hub suggestions immediately.",
            )}
          </p>
          <div className="flex items-center justify-between border border-border/60 bg-sand/80 px-3 py-3 text-sm">
            <span>
              {styleEnabled
                ? tn("المحرّك يعمل", "Engine on")
                : tn("المحرّك متوقف", "Engine off")}
            </span>
            <Button
              size="sm"
              className="rounded-none"
              variant={styleEnabled ? "outline" : "default"}
              onClick={async () => {
                const next = !styleEnabled;
                await fetch("/api/style/settings", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ enabled: next }),
                });
                setStyleEnabled(next);
              }}
            >
              {styleEnabled
                ? tn("إيقاف", "Disable")
                : tn("تشغيل", "Enable")}
            </Button>
          </div>
          {styleMeta && (
            <div className="space-y-2 text-sm">
              <p className="font-medium">{tn("قواعد مفعّلة", "Active rules")}</p>
              {styleMeta.ruleCounts.map((r) => (
                <p key={r.kind} className="text-muted-foreground">
                  {r.kind}: {r._count}
                </p>
              ))}
              <p className="mt-3 font-medium">{tn("فيدباك", "Feedback")}</p>
              {styleMeta.feedback.length === 0 ? (
                <p className="text-muted-foreground">
                  {tn("لا فيدباك بعد", "No feedback yet")}
                </p>
              ) : (
                styleMeta.feedback.map((f) => (
                  <p key={f.vote} className="text-muted-foreground">
                    {f.vote}: {f._count}
                  </p>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {tab === "pilot" && (
        <section className="space-y-4">
          <h2 className="font-display text-xl">
            {tn("إطلاق تجريبي", "Pilot launch")}
          </h2>
          <p className="text-xs text-muted-foreground" dir="ltr">
            {pilotHealth}
          </p>
          <p className="text-sm">
            {tn("أخطاء ٢٤ ساعة", "Errors (24h)")}: {errorCount24h}
          </p>
          <a
            href="/pilot"
            className="inline-flex h-9 items-center justify-center rounded-none bg-primary px-4 text-sm text-primary-foreground"
          >
            {tn("افتح لوحة الجاهزية", "Open readiness board")}
          </a>
          <a
            href="/legal"
            className="ms-2 inline-flex h-9 items-center justify-center rounded-none border border-border px-4 text-sm"
          >
            {tn("قانوني", "Legal")}
          </a>
        </section>
      )}
    </div>
  );
}
