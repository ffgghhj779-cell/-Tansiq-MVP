"use client";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { COLORS, PRODUCTS, formatSar } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

type Tool = "match" | "complete" | "budget" | "color";

type Suggestion = {
  product: Product;
  reasonAr: string;
  reasonEn: string;
  score: number;
};

type EnginePayload = {
  enabled: boolean;
  source: string;
  tool: string;
  suggestions: Suggestion[];
  look?: {
    titleAr: string;
    titleEn: string;
    reasonAr: string;
    reasonEn: string;
    cover: string;
    products: Product[];
    total: number;
  };
  meta?: { sum?: number; budget?: number };
};

function StyleHubInner() {
  const { t, tn, locale } = useI18n();
  const params = useSearchParams();
  const initial = (params.get("tool") as Tool) || "match";
  const [tool, setTool] = useState<Tool>(initial);
  const [seedId, setSeedId] = useState("p1");
  const [budget, setBudget] = useState(500);
  const [colorId, setColorId] = useState("olive");
  const [occasion, setOccasion] = useState<"cafe" | "campus" | "street">("cafe");
  const [data, setData] = useState<EnginePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, "good" | "not_for_me">>({});

  const tools: { id: Tool; label: string }[] = [
    { id: "match", label: t("matchTool") },
    { id: "complete", label: t("completeLook") },
    { id: "budget", label: t("budgetTool") },
    { id: "color", label: t("colorTool") },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({
        tool,
        seed: seedId,
        budget: String(budget),
        occasion,
        color: colorId,
      });
      const res = await fetch(`/api/style/suggest?${q}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setData(json);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [tool, seedId, budget, occasion, colorId]);

  useEffect(() => {
    void load();
  }, [load]);

  const sendFeedback = async (
    suggestedProductId: string,
    vote: "good" | "not_for_me",
  ) => {
    setVotes((prev) => ({ ...prev, [suggestedProductId]: vote }));
    await fetch("/api/style/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool,
        seedProductId: seedId,
        suggestedProductId,
        vote,
      }),
    });
  };

  const colorMeta = COLORS.find((c) => c.id === colorId)!;
  const seed = PRODUCTS.find((p) => p.id === seedId) ?? PRODUCTS[0];

  return (
    <div className="space-y-6 pb-20 md:pb-10">
      <div>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          {tn("مركز الستايل", "Style hub")}
        </h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {tn(
            "اكتشف ماذا يلبس مع ماذا — اقتراحات من الكتالوج مع أسباب واضحة للون والقماش.",
            "Discover what goes with what — catalog suggestions with clear color and fabric reasons.",
          )}
        </p>
      </div>

      <div className="h-scroll flex gap-2 pb-1">
        {tools.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTool(item.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm transition",
              tool === item.id
                ? "bg-olive text-primary-foreground"
                : "border border-border bg-card/70 text-ink hover:bg-accent",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {data && !data.enabled && (
        <div className="atmosphere-panel border border-border/60 px-4 py-5 text-sm text-muted-foreground">
          {tn(
            "محرك الستايل متوقف مؤقتًا من لوحة الإدارة.",
            "The style engine is temporarily disabled from admin.",
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {loading && (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      )}

      {!loading && data?.enabled && tool === "match" && (
        <div className="space-y-5">
          <div className="h-scroll flex gap-3">
            {PRODUCTS.slice(0, 8).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSeedId(p.id)}
                className={cn(
                  "relative h-20 w-16 shrink-0 overflow-hidden border-2",
                  seedId === p.id ? "border-olive" : "border-transparent",
                )}
              >
                <Image src={p.images[0]} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
          <div className="atmosphere-panel flex gap-4 border border-border/50 p-4">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-mist">
              <Image src={seed.images[0]} alt="" fill className="object-cover" sizes="80px" />
            </div>
            <div>
              <p className="text-sm font-medium">{tn(seed.titleAr, seed.titleEn)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {tn(
                  "اقتراحات بتناسق اللون والقماش لهذا القطعة.",
                  "Color and fabric harmony suggestions for this piece.",
                )}
              </p>
            </div>
          </div>
          <SuggestionGrid
            items={data.suggestions}
            tn={tn}
            reasonLabel={t("reason")}
            votes={votes}
            onVote={sendFeedback}
          />
        </div>
      )}

      {!loading && data?.enabled && tool === "complete" && data.look && (
        <div className="space-y-5">
          <div className="relative aspect-[16/10] overflow-hidden bg-mist md:aspect-[21/9]">
            {data.look.cover && (
              <Image
                src={data.look.cover}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-2xl text-white md:text-3xl">
                {tn(data.look.titleAr, data.look.titleEn)}
              </p>
              <p className="mt-1 text-sm text-white/85">
                {tn(data.look.reasonAr, data.look.reasonEn)}
              </p>
            </div>
          </div>
          <SuggestionGrid
            items={data.suggestions}
            tn={tn}
            reasonLabel={t("reason")}
            votes={votes}
            onVote={sendFeedback}
            hideReason
          />
          <p className="text-sm text-muted-foreground">
            {tn("المجموع التقريبي", "Approx. total")}:{" "}
            {formatSar(data.look.total, locale)}
          </p>
        </div>
      )}

      {!loading && data?.enabled && tool === "budget" && (
        <div className="space-y-5">
          <div className="atmosphere-panel space-y-4 border border-border/50 p-5">
            <label className="block text-sm font-medium">
              {tn("ميزانيتك (ر.س)", "Your budget (SAR)")}: {budget}
            </label>
            <input
              type="range"
              min={200}
              max={900}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[var(--olive)]"
            />
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["cafe", "مقهى", "Café"],
                  ["campus", "جامعة", "Campus"],
                  ["street", "ستريت", "Street"],
                ] as const
              ).map(([id, ar, en]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setOccasion(id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm",
                    occasion === id
                      ? "bg-olive text-primary-foreground"
                      : "border border-border",
                  )}
                >
                  {tn(ar, en)}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {tn("إطلالة ضمن الميزانية", "Look within budget")}:{" "}
            {formatSar(Number(data.meta?.sum ?? 0), locale)} /{" "}
            {formatSar(budget, locale)}
          </p>
          <SuggestionGrid
            items={data.suggestions}
            tn={tn}
            reasonLabel={t("reason")}
            votes={votes}
            onVote={sendFeedback}
          />
        </div>
      )}

      {!loading && data?.enabled && tool === "color" && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColorId(c.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                  colorId === c.id ? "border-olive bg-accent" : "border-border",
                )}
              >
                <span
                  className="size-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: c.hex }}
                />
                {tn(c.ar, c.en)}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {tn(
              `قطع تقترب من «${colorMeta.ar}» عبر قواعد الألوان في DB.`,
              `Pieces near “${colorMeta.en}” via DB color rules.`,
            )}
          </p>
          <SuggestionGrid
            items={data.suggestions}
            tn={tn}
            reasonLabel={t("reason")}
            votes={votes}
            onVote={sendFeedback}
          />
          {data.suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("emptyList")}</p>
          )}
        </div>
      )}

      <Link
        href="/products"
        className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-sm hover:bg-muted"
      >
        {tn("تصفح الكتالوج كاملًا", "Browse full catalog")}
      </Link>
    </div>
  );
}

function SuggestionGrid({
  items,
  tn,
  reasonLabel,
  votes,
  onVote,
  hideReason,
}: {
  items: Suggestion[];
  tn: (ar: string, en: string) => string;
  reasonLabel: string;
  votes: Record<string, "good" | "not_for_me">;
  onVote: (id: string, vote: "good" | "not_for_me") => void;
  hideReason?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((m) => (
        <div key={m.product.id} className="space-y-2">
          <ProductCard product={m.product} />
          {!hideReason && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-olive">{reasonLabel} </span>
              {tn(m.reasonAr, m.reasonEn)}
            </p>
          )}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={votes[m.product.id] === "good" ? "default" : "outline"}
              className="h-7 flex-1 rounded-none px-1 text-[10px]"
              onClick={() => onVote(m.product.id, "good")}
            >
              {tn("مناسب", "Good")}
            </Button>
            <Button
              size="sm"
              variant={
                votes[m.product.id] === "not_for_me" ? "default" : "outline"
              }
              className="h-7 flex-1 rounded-none px-1 text-[10px]"
              onClick={() => onVote(m.product.id, "not_for_me")}
            >
              {tn("ليس لي", "Not for me")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StylePage() {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-muted-foreground">…</div>}>
      <StyleHubInner />
    </Suspense>
  );
}
