"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Checklist = {
  ready: boolean;
  checks: {
    id: string;
    labelAr: string;
    labelEn: string;
    ok: boolean;
    detail?: string;
  }[];
  config: {
    appVersion: string;
    pilotCity: string;
    pilotCities: string[];
    codOwner: string;
    legalStatus: string;
    legalEntityName: string;
    legalCr: string;
    supportEmail: string;
    supportPhone: string;
  };
};

export default function PilotPage() {
  const { tn } = useI18n();
  const [data, setData] = useState<Checklist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [city, setCity] = useState("Riyadh");
  const [codOwner, setCodOwner] = useState("");
  const [legalStatus, setLegalStatus] = useState("pending_via");
  const [health, setHealth] = useState<string>("…");

  const load = useCallback(async () => {
    setError(null);
    try {
      const [pilotRes, healthRes] = await Promise.all([
        fetch("/api/pilot/config"),
        fetch("/api/health"),
      ]);
      const pilot = await pilotRes.json();
      const h = await healthRes.json();
      if (!pilotRes.ok) throw new Error(pilot.error || "Failed");
      setData(pilot.checklist);
      setCity(pilot.config.pilotCity);
      setCodOwner(pilot.config.codOwner);
      setLegalStatus(pilot.config.legalStatus);
      setHealth(
        h.ok
          ? `OK · v${h.version} · ${h.latencyMs}ms · ${h.pilotCity}`
          : `DOWN · ${h.error || h.status}`,
      );
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/pilot/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotCity: city,
          codOwner,
          legalStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setData(json.checklist);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">
          {tn("مرحلة 5", "Phase 5")}
        </p>
        <h1 className="font-display text-3xl text-ink">
          {tn("جاهزية الإطلاق التجريبي", "Pilot readiness")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tn(
            "قائمة تحقق تشغيلية — القانوني النهائي ينتظر Via.",
            "Ops checklist — final legal awaits Via.",
          )}
        </p>
      </div>

      <div
        className={cn(
          "border px-4 py-3 text-sm",
          data?.ready
            ? "border-olive/40 bg-sand/80 text-ink"
            : "border-border bg-accent/50 text-muted-foreground",
        )}
      >
        {data?.ready
          ? tn(
              "جاهز لإطلاق تجريبي ناعم (ما عدا ختم Via القانوني إن لزم).",
              "Soft-pilot ready (aside from Via legal seal if required).",
            )
          : tn("ما زالت بنود تشغيلية ناقصة.", "Operational items still open.")}
        <p className="mt-1 text-xs" dir="ltr">
          Health: {health}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <section className="space-y-3">
        <h2 className="font-display text-xl">{tn("قائمة التحقق", "Checklist")}</h2>
        {!data ? (
          <p className="text-sm text-muted-foreground">{tn("تحميل…", "Loading…")}</p>
        ) : (
          data.checks.map((c) => (
            <div
              key={c.id}
              className="flex items-start justify-between gap-3 border border-border/60 bg-sand/70 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-ink">{tn(c.labelAr, c.labelEn)}</p>
                {c.detail && (
                  <p className="text-xs text-muted-foreground">{c.detail}</p>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 text-xs font-medium",
                  c.ok ? "text-olive" : "text-destructive",
                )}
              >
                {c.ok ? "OK" : "OPEN"}
              </span>
            </div>
          ))
        )}
      </section>

      <section className="atmosphere-panel space-y-3 border border-border/50 p-5">
        <h2 className="font-display text-xl">
          {tn("ضبط الإطلاق", "Launch controls")}
        </h2>
        <div className="space-y-2">
          <Label>{tn("مدينة الإطلاق", "Launch city")}</Label>
          <select
            className="h-10 w-full border border-border bg-sand/80 px-3 text-sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {(data?.config.pilotCities || ["Riyadh", "Jeddah"]).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>{tn("مسؤول COD", "COD owner")}</Label>
          <Input
            value={codOwner}
            onChange={(e) => setCodOwner(e.target.value)}
            className="rounded-none bg-sand/70"
            placeholder="Ops owner name / team"
          />
        </div>
        <div className="space-y-2">
          <Label>{tn("حالة القانوني", "Legal status")}</Label>
          <select
            className="h-10 w-full border border-border bg-sand/80 px-3 text-sm"
            value={legalStatus}
            onChange={(e) => setLegalStatus(e.target.value)}
          >
            <option value="pending_via">pending_via</option>
            <option value="draft">draft</option>
            <option value="ready">ready</option>
          </select>
        </div>
        <Button
          className="w-full rounded-none"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? tn("حفظ…", "Saving…") : tn("حفظ الإعدادات", "Save settings")}
        </Button>
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/legal" className="text-olive underline-offset-4 hover:underline">
          {tn("الصفحات القانونية", "Legal pages")}
        </Link>
        <Link href="/admin" className="text-olive underline-offset-4 hover:underline">
          {tn("الإدارة", "Admin")}
        </Link>
        <Link href="/home" className="text-muted-foreground underline-offset-4 hover:underline">
          {tn("التسوق", "Shop")}
        </Link>
      </div>
    </div>
  );
}
