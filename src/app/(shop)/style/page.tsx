"use client";

import { ProductCard } from "@/components/product/product-card";
import {
  COLORS,
  LOOKS,
  PRODUCTS,
  WEAR_WITH,
  formatSar,
  getProduct,
} from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Tool = "match" | "complete" | "budget" | "color";

function StyleHubInner() {
  const { t, tn, locale } = useI18n();
  const params = useSearchParams();
  const initial = (params.get("tool") as Tool) || "match";
  const [tool, setTool] = useState<Tool>(initial);
  const [seedId, setSeedId] = useState("p1");
  const [budget, setBudget] = useState(500);
  const [colorId, setColorId] = useState("olive");
  const [occasion, setOccasion] = useState<"cafe" | "campus" | "street">("cafe");

  const tools: { id: Tool; label: string }[] = [
    { id: "match", label: t("matchTool") },
    { id: "complete", label: t("completeLook") },
    { id: "budget", label: t("budgetTool") },
    { id: "color", label: t("colorTool") },
  ];

  const seed = getProduct(seedId)!;
  const matches = WEAR_WITH[seedId] ?? WEAR_WITH.p1;

  const completeLook = useMemo(() => {
    const look =
      LOOKS.find((l) => l.productIds.includes(seedId)) ?? LOOKS[0];
    return look;
  }, [seedId]);

  const budgetResults = useMemo(() => {
    const pool =
      occasion === "street"
        ? PRODUCTS.filter((p) => p.gender === "men")
        : PRODUCTS.filter((p) => p.gender === "women");
    const pick: typeof PRODUCTS = [];
    let sum = 0;
    for (const p of pool) {
      if (sum + p.price <= budget) {
        pick.push(p);
        sum += p.price;
      }
      if (pick.length >= 4) break;
    }
    return { pick, sum };
  }, [budget, occasion]);

  const colorResults = useMemo(() => {
    return PRODUCTS.filter((p) => p.colors.includes(colorId)).slice(0, 6);
  }, [colorId]);

  const colorMeta = COLORS.find((c) => c.id === colorId)!;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          {tn("مركز الستايل", "Style hub")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tn(
            "اقتراحات من الكتالوج فقط — مع سبب عربي قصير.",
            "Catalog-backed suggestions — with a short reason.",
          )}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
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

      {tool === "match" && (
        <div className="space-y-5">
          <div className="flex gap-3 overflow-x-auto">
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
                {tn("اختر قطعة لترى ما يناسبها من الكتالوج.", "Pick a piece to see catalog matches.")}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {matches.map((m) => {
              const p = getProduct(m.productId)!;
              return (
                <div key={m.productId} className="space-y-2">
                  <ProductCard product={p} />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-olive">{t("reason")} </span>
                    {tn(m.reasonAr, m.reasonEn)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tool === "complete" && (
        <div className="space-y-5">
          <div className="relative aspect-[16/10] overflow-hidden bg-mist md:aspect-[21/9]">
            <Image
              src={completeLook.cover}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-display text-2xl text-white md:text-3xl">
                {tn(completeLook.titleAr, completeLook.titleEn)}
              </p>
              <p className="mt-1 text-sm text-white/85">
                {tn(completeLook.reasonAr, completeLook.reasonEn)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {completeLook.productIds.map((id) => {
              const p = getProduct(id)!;
              return <ProductCard key={id} product={p} />;
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            {tn("المجموع التقريبي", "Approx. total")}:{" "}
            {formatSar(
              completeLook.productIds.reduce(
                (s, id) => s + (getProduct(id)?.price ?? 0),
                0,
              ),
              locale,
            )}
          </p>
        </div>
      )}

      {tool === "budget" && (
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
            {formatSar(budgetResults.sum, locale)} / {formatSar(budget, locale)}
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {budgetResults.pick.map((p) => (
              <div key={p.id} className="space-y-2">
                <ProductCard product={p} />
                <p className="text-xs text-muted-foreground">
                  {tn(
                    "اخترنا قطعًا تكتمل معًا دون تجاوز السقف.",
                    "Pieces chosen to complete together under your cap.",
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tool === "color" && (
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
              `قطع تقترب من «${colorMeta.ar}» أو تحمله كلون أساسي.`,
              `Pieces near “${colorMeta.en}” or carrying it as a primary.`,
            )}
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {colorResults.map((p) => (
              <div key={p.id} className="space-y-2">
                <ProductCard product={p} />
                <p className="text-xs text-muted-foreground">
                  {tn(
                    "محايدات أو تدرجات من نفس العائلة تُبقي الإطلالة هادئة.",
                    "Neutrals or same-family tones keep the look calm.",
                  )}
                </p>
              </div>
            ))}
          </div>
          {colorResults.length === 0 && (
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

export default function StylePage() {
  return (
    <Suspense fallback={<div className="py-10 text-sm text-muted-foreground">…</div>}>
      <StyleHubInner />
    </Suspense>
  );
}
