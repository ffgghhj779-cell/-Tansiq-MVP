import type { Product as DbProduct } from "@prisma/client";
import { prisma } from "./prisma";
import { mapProduct } from "./mappers";
import type { Product } from "./types";

export type StyleSuggestion = {
  product: Product;
  reasonAr: string;
  reasonEn: string;
  score: number;
  ruleKey?: string;
};

export type StyleEngineResult = {
  enabled: boolean;
  source: "db" | "disabled";
  tool: string;
  suggestions: StyleSuggestion[];
  look?: {
    titleAr: string;
    titleEn: string;
    reasonAr: string;
    reasonEn: string;
    cover: string;
    productIds: string[];
    products: Product[];
    total: number;
  };
  meta?: Record<string, unknown>;
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function isStyleEngineEnabled() {
  const row = await prisma.appSetting.findUnique({
    where: { key: "style_engine_enabled" },
  });
  if (!row) return true;
  return row.value !== "false" && row.value !== "0";
}

export async function setStyleEngineEnabled(enabled: boolean) {
  return prisma.appSetting.upsert({
    where: { key: "style_engine_enabled" },
    create: { key: "style_engine_enabled", value: enabled ? "true" : "false" },
    update: { value: enabled ? "true" : "false" },
  });
}

function toProduct(row: DbProduct): Product {
  return mapProduct(row);
}

async function loadCatalogProducts() {
  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProduct);
}

function fabricTokens(p: Product) {
  const fromEn = p.fabricEn.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const known = ["linen", "denim", "cotton", "wool", "knit", "silk", "canvas"];
  const hits = known.filter(
    (k) =>
      fromEn.includes(k) ||
      p.fabricEn.toLowerCase().includes(k) ||
      p.tags.some((t) => t.toLowerCase().includes(k)),
  );
  return [...new Set([...hits, ...p.fabricChips.map((c) => c.toLowerCase())])];
}

/**
 * Score how well candidate pairs with seed using color/fabric DB rules + overlap.
 */
function scoreCandidate(
  seed: Product,
  candidate: Product,
  colorPairs: Map<string, { reasonAr: string; reasonEn: string; weight: number }>,
  fabricPairs: Map<string, { reasonAr: string; reasonEn: string; weight: number }>,
) {
  let score = 0;
  let reasonAr = "";
  let reasonEn = "";

  for (const sc of seed.colors) {
    for (const cc of candidate.colors) {
      const hit =
        colorPairs.get(`${sc}:${cc}`) || colorPairs.get(`${cc}:${sc}`);
      if (hit) {
        score += hit.weight;
        if (!reasonAr) {
          reasonAr = hit.reasonAr;
          reasonEn = hit.reasonEn;
        }
      }
      if (sc === cc) score += 4;
    }
  }

  for (const sf of fabricTokens(seed)) {
    for (const cf of fabricTokens(candidate)) {
      const hit =
        fabricPairs.get(`${sf}:${cf}`) || fabricPairs.get(`${cf}:${sf}`);
      if (hit) {
        score += hit.weight;
        if (!reasonAr) {
          reasonAr = hit.reasonAr;
          reasonEn = hit.reasonEn;
        }
      }
    }
  }

  // Same gender preference, avoid identical product
  if (seed.gender === candidate.gender) score += 3;
  if (seed.id === candidate.id) score = -999;

  if (!reasonAr) {
    reasonAr = "من الكتالوج — تناسق لون/قماش هادئ";
    reasonEn = "From the catalog — calm color/fabric harmony";
  }

  return { score, reasonAr, reasonEn };
}

export async function suggestMatch(seedProductId: string): Promise<StyleEngineResult> {
  const enabled = await isStyleEngineEnabled();
  if (!enabled) {
    return { enabled: false, source: "disabled", tool: "match", suggestions: [] };
  }

  const catalog = await loadCatalogProducts();
  const seed = catalog.find((p) => p.id === seedProductId) ?? catalog[0];
  if (!seed) {
    return { enabled: true, source: "db", tool: "match", suggestions: [] };
  }

  const wearRules = await prisma.styleRule.findMany({
    where: {
      enabled: true,
      OR: [
        { kind: "wear", sourceId: seed.id },
        { key: { startsWith: `wear:${seed.id}:` } },
      ],
    },
    orderBy: { weight: "desc" },
  });

  const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));
  const fromWear: StyleSuggestion[] = [];
  for (const r of wearRules) {
    const targetId =
      r.targetId ||
      (r.key.startsWith("wear:") ? r.key.split(":")[2] : "");
    const product = byId[targetId];
    if (!product) continue;
    fromWear.push({
      product,
      reasonAr: r.reasonAr,
      reasonEn: r.reasonEn,
      score: r.weight + 50,
      ruleKey: r.key,
    });
  }

  if (fromWear.length >= 3) {
    return {
      enabled: true,
      source: "db",
      tool: "match",
      suggestions: fromWear.slice(0, 6),
      meta: { seedProductId: seed.id },
    };
  }

  const colorRules = await prisma.styleRule.findMany({
    where: { enabled: true, kind: "color_pair" },
  });
  const fabricRules = await prisma.styleRule.findMany({
    where: { enabled: true, kind: "fabric_pair" },
  });
  const colorPairs = new Map(
    colorRules.map((r) => [
      `${r.sourceId}:${r.targetId}`,
      { reasonAr: r.reasonAr, reasonEn: r.reasonEn, weight: r.weight },
    ]),
  );
  const fabricPairs = new Map(
    fabricRules.map((r) => [
      `${r.sourceId.toLowerCase()}:${r.targetId.toLowerCase()}`,
      { reasonAr: r.reasonAr, reasonEn: r.reasonEn, weight: r.weight },
    ]),
  );

  const scored = catalog
    .filter((p) => p.id !== seed.id)
    .map((p) => {
      const s = scoreCandidate(seed, p, colorPairs, fabricPairs);
      return { product: p, ...s };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const merged = [...fromWear];
  for (const s of scored) {
    if (merged.some((m) => m.product.id === s.product.id)) continue;
    merged.push(s);
    if (merged.length >= 6) break;
  }

  return {
    enabled: true,
    source: "db",
    tool: "match",
    suggestions: merged,
    meta: { seedProductId: seed.id },
  };
}

export async function suggestComplete(seedProductId?: string): Promise<StyleEngineResult> {
  const enabled = await isStyleEngineEnabled();
  if (!enabled) {
    return { enabled: false, source: "disabled", tool: "complete", suggestions: [] };
  }

  const looks = await prisma.styleRule.findMany({
    where: { enabled: true, kind: "look" },
    orderBy: { weight: "desc" },
  });
  const catalog = await loadCatalogProducts();
  const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));

  let chosen = looks[0];
  if (seedProductId) {
    chosen =
      looks.find((l) => {
        const meta = parseJson<{ productIds?: string[] }>(l.metaJson, {});
        return meta.productIds?.includes(seedProductId);
      }) ?? looks[0];
  }
  if (!chosen) {
    return { enabled: true, source: "db", tool: "complete", suggestions: [] };
  }

  const meta = parseJson<{
    productIds?: string[];
    cover?: string;
    titleAr?: string;
    titleEn?: string;
  }>(chosen.metaJson, {});
  const ids = meta.productIds ?? [];
  const products = ids.map((id) => byId[id]).filter(Boolean) as Product[];

  return {
    enabled: true,
    source: "db",
    tool: "complete",
    suggestions: products.map((p) => ({
      product: p,
      reasonAr: chosen.reasonAr,
      reasonEn: chosen.reasonEn,
      score: chosen.weight,
      ruleKey: chosen.key,
    })),
    look: {
      titleAr: meta.titleAr ?? chosen.reasonAr,
      titleEn: meta.titleEn ?? chosen.reasonEn,
      reasonAr: chosen.reasonAr,
      reasonEn: chosen.reasonEn,
      cover: meta.cover ?? products[0]?.images[0] ?? "",
      productIds: ids,
      products,
      total: products.reduce((s, p) => s + p.price, 0),
    },
  };
}

export async function suggestBudget(input: {
  budget: number;
  occasion: "cafe" | "campus" | "street";
}): Promise<StyleEngineResult> {
  const enabled = await isStyleEngineEnabled();
  if (!enabled) {
    return { enabled: false, source: "disabled", tool: "budget", suggestions: [] };
  }

  const catalog = await loadCatalogProducts();
  const pool =
    input.occasion === "street"
      ? catalog.filter((p) => p.gender === "men")
      : catalog.filter((p) => p.gender === "women");

  const templates = await prisma.styleRule.findMany({
    where: { enabled: true, kind: "template", sourceId: "budget" },
  });
  const tmpl = templates[0];

  const pick: Product[] = [];
  let sum = 0;
  for (const p of pool) {
    if (sum + p.price <= input.budget) {
      pick.push(p);
      sum += p.price;
    }
    if (pick.length >= 4) break;
  }

  return {
    enabled: true,
    source: "db",
    tool: "budget",
    suggestions: pick.map((p) => ({
      product: p,
      reasonAr:
        tmpl?.reasonAr ??
        "اخترنا قطعًا من الكتالوج تكتمل معًا دون تجاوز السقف",
      reasonEn:
        tmpl?.reasonEn ??
        "Catalog pieces chosen to complete together under your cap",
      score: 10,
      ruleKey: tmpl?.key,
    })),
    meta: { sum, budget: input.budget, occasion: input.occasion },
  };
}

export async function suggestColor(colorId: string): Promise<StyleEngineResult> {
  const enabled = await isStyleEngineEnabled();
  if (!enabled) {
    return { enabled: false, source: "disabled", tool: "color", suggestions: [] };
  }

  const catalog = await loadCatalogProducts();
  const pairRules = await prisma.styleRule.findMany({
    where: {
      enabled: true,
      kind: "color_pair",
      OR: [{ sourceId: colorId }, { targetId: colorId }],
    },
  });
  const related = new Set<string>([colorId]);
  for (const r of pairRules) {
    related.add(r.sourceId);
    related.add(r.targetId);
  }

  const tmpl = await prisma.styleRule.findFirst({
    where: { enabled: true, kind: "template", sourceId: "color" },
  });

  const hits = catalog
    .filter((p) => p.colors.some((c) => related.has(c)))
    .slice(0, 6);

  return {
    enabled: true,
    source: "db",
    tool: "color",
    suggestions: hits.map((p) => ({
      product: p,
      reasonAr:
        tmpl?.reasonAr ??
        "محايدات أو تدرجات من نفس العائلة تُبقي الإطلالة هادئة",
      reasonEn:
        tmpl?.reasonEn ??
        "Neutrals or same-family tones keep the look calm",
      score: p.colors.includes(colorId) ? 20 : 12,
      ruleKey: tmpl?.key,
    })),
    meta: { colorId, related: [...related] },
  };
}
