"use client";

import { ProductCard } from "@/components/product/product-card";
import {
  EmptyState,
  ErrorState,
  ProductGridSkeleton,
} from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ProductsInner() {
  const { t, tn } = useI18n();
  const params = useSearchParams();
  const filter = params.get("filter");
  const [gender, setGender] = useState<"all" | "women" | "men">(() =>
    filter === "women" || filter === "men" ? filter : "all",
  );
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">(
    "loading",
  );
  const [source, setSource] = useState("db");

  useEffect(() => {
    if (filter === "women" || filter === "men") setGender(filter);
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setStatus("loading");
      try {
        const sp = new URLSearchParams();
        if (gender !== "all") sp.set("gender", gender);
        if (filter && filter !== "women" && filter !== "men") sp.set("filter", filter);
        if (q.trim()) sp.set("q", q.trim());
        const res = await fetch(`/api/products?${sp.toString()}`);
        const data = await res.json();
        if (cancelled) return;
        setSource(data.source || "db");
        const list = (data.items || []) as Product[];
        setItems(list);
        setStatus(list.length ? "ready" : "empty");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };
    const tmr = window.setTimeout(() => void run(), q ? 220 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(tmr);
    };
  }, [gender, filter, q]);

  if (status === "loading") return <ProductGridSkeleton />;
  if (status === "error")
    return <ErrorState onRetry={() => setStatus("loading")} />;
  if (status === "empty")
    return (
      <EmptyState
        title={t("emptyList")}
        hint={tn(
          "جرّب فلترًا أوسع أو مركز الستايل.",
          "Try a wider filter or the Style hub.",
        )}
        actionLabel={t("ctaStyle")}
        onAction={() => {
          window.location.href = "/style";
        }}
      />
    );

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">
            {tn("الكتالوج", "Catalog")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} {tn("قطعة", "pieces")}
            <span className="ms-2 text-[10px] uppercase tracking-wide opacity-60">
              {source}
            </span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground"
          onClick={() => setStatus("error")}
        >
          {tn("محاكاة خطأ", "Simulate error")}
        </Button>
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("search")}
        className="h-11 rounded-none border-border/80 bg-sand/80"
      />

      <div className="flex gap-2">
        {(
          [
            ["all", "الكل", "All"],
            ["women", "نساء", "Women"],
            ["men", "رجال", "Men"],
          ] as const
        ).map(([id, ar, en]) => (
          <button
            key={id}
            type="button"
            onClick={() => setGender(id)}
            className={cn(
              "rounded-none px-4 py-1.5 text-sm",
              gender === id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card/60",
            )}
          >
            {tn(ar, en)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <ProductsInner />
    </Suspense>
  );
}
