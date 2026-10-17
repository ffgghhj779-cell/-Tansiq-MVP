"use client";

import { ProductCard } from "@/components/product/product-card";
import {
  EmptyState,
  ErrorState,
  ProductGridSkeleton,
} from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

function ProductsInner() {
  const { t, tn } = useI18n();
  const params = useSearchParams();
  const filter = params.get("filter");
  const [gender, setGender] = useState<"all" | "women" | "men">("all");
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">(
    "loading",
  );

  useEffect(() => {
    setStatus("loading");
    const timer = setTimeout(() => setStatus("ready"), 450);
    return () => clearTimeout(timer);
  }, [gender, filter]);

  const list = useMemo(() => {
    let items = [...PRODUCTS];
    if (gender !== "all") items = items.filter((p) => p.gender === gender);
    if (filter === "budget") items = items.filter((p) => p.budgetFriendly);
    if (filter === "indie") items = items.filter((p) => p.independent);
    return items;
  }, [gender, filter]);

  useEffect(() => {
    if (status === "ready" && list.length === 0) setStatus("empty");
  }, [list, status]);

  if (status === "loading") return <ProductGridSkeleton />;
  if (status === "error")
    return <ErrorState onRetry={() => setStatus("loading")} />;
  if (status === "empty")
    return (
      <EmptyState
        title={t("emptyList")}
        hint={tn("جرّب فلترًا أوسع أو مركز الستايل.", "Try a wider filter or the Style hub.")}
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
            {list.length} {tn("قطعة", "pieces")}
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
              "rounded-full px-4 py-1.5 text-sm",
              gender === id
                ? "bg-olive text-primary-foreground"
                : "border border-border bg-card/60",
            )}
          >
            {tn(ar, en)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {list.map((p) => (
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
