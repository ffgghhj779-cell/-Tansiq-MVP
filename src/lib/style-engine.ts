import type { Product as DbProduct } from "@prisma/client";
import { LOOKS, PRODUCTS, WEAR_WITH } from "./catalog";
import { isDatabaseConfigured } from "./db";
import { mapProduct } from "./mappers";
import { prisma } from "./prisma";
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
  source: "db" | "catalog" | "disabled";
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
  if (!isDatabaseConfigured()) return true;
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: "style_engine_enabled" },
    });
    if (!row) return true;
    return row.value !== "false" && row.value !== "0";
  } catch {
    return true;
  }
}

export async function setStyleEngineEnabled(enabled: boolean) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database is not configured");
  }
  return prisma.appSetting.upsert({
    where: { key: "style_engine_enabled" },
    create: { key: "style_engine_enabled", value: enabled ? "true" : "false" },
    update: { value: enabled ? "true" : "false" },
  });
}

function toProduct(row: DbProduct): Product {
  return mapProduct(row);
}

async function loadCatalogProducts(): Promise<{
  products: Product[];
  source: "db" | "catalog";
}> {
  if (!isDatabaseConfigured()) {
    return { products: [...PRODUCTS], source: "catalog" };
  }
  try {
    const rows = await prisma.product.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
    if (rows.length === 0) {
      return { products: [...PRODUCTS], source: "catalog" };
    }
    return { products: rows.map(toProduct), source: "db" };
  } catch {
    return { products: [...PRODUCTS], source: "catalog" };
  }
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

/** Built-in harmony when DB style rules are unavailable (e.g. Vercel without Postgres). */
const FALLBACK_COLOR_PAIRS: Array<{
  a: string;
  b: string;
  reasonAr: string;
  reasonEn: string;
  weight: number;
}> = [
  { a: "ivory", b: "denim", reasonAr: "عاجي مع دنيم يومي هادئ", reasonEn: "Ivory with calm everyday denim", weight: 12 },
  { a: "ivory", b: "black", reasonAr: "عاجي وأسود — تباين مرتب", reasonEn: "Ivory and black — tidy contrast", weight: 11 },
  { a: "beige", b: "denim", reasonAr: "بيج مع جينز كلاسيكي", reasonEn: "Beige with classic denim", weight: 11 },
  { a: "olive", b: "navy", reasonAr: "زيتي وكحلي متوازيان", reasonEn: "Olive and navy in parallel", weight: 12 },
  { a: "sand", b: "white", reasonAr: "رملي وأبيض يفتحان الإطلالة", reasonEn: "Sand and white open the look", weight: 10 },
  { a: "camel", b: "ivory", reasonAr: "جملي مع عاجي دافئ", reasonEn: "Camel with warm ivory", weight: 10 },
  { a: "black", b: "white", reasonAr: "أسود وأبيض أساس نظيف", reasonEn: "Black and white clean base", weight: 9 },
  { a: "gray", b: "denim", reasonAr: "رمادي مع دنيم ناعم", reasonEn: "Gray with soft denim", weight: 9 },
];

const FALLBACK_FABRIC_PAIRS: Array<{
  a: string;
  b: string;
  reasonAr: string;
  reasonEn: string;
  weight: number;
}> = [
  { a: "linen", b: "denim", reasonAr: "كتان خفيف يوازن الدنيم", reasonEn: "Light linen balances denim", weight: 14 },
  { a: "knit", b: "denim", reasonAr: "تريكو مع جينز يومي", reasonEn: "Knit with everyday denim", weight: 12 },
  { a: "cotton", b: "denim", reasonAr: "قطن مع دنيم مريح", reasonEn: "Cotton with easy denim", weight: 10 },
  { a: "linen", b: "cotton", reasonAr: "كتان وقطن لحر الرياض", reasonEn: "Linen and cotton for Riyadh heat", weight: 11 },
];

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

  if (seed.gender === candidate.gender) score += 3;
  if (seed.id === candidate.id) score = -999;

  if (!reasonAr) {
    reasonAr = "من الكتالوج — تناسق لون/قماش هادئ";
    reasonEn = "From the catalog — calm color/fabric harmony";
  }

  return { score, reasonAr, reasonEn };
}

function fallbackPairMaps() {
  const colorPairs = new Map(
    FALLBACK_COLOR_PAIRS.map((r) => [
      `${r.a}:${r.b}`,
      { reasonAr: r.reasonAr, reasonEn: r.reasonEn, weight: r.weight },
    ]),
  );
  const fabricPairs = new Map(
    FALLBACK_FABRIC_PAIRS.map((r) => [
      `${r.a}:${r.b}`,
      { reasonAr: r.reasonAr, reasonEn: r.reasonEn, weight: r.weight },
    ]),
  );
  return { colorPairs, fabricPairs };
}

function wearFromCatalog(seedId: string, catalog: Product[]): StyleSuggestion[] {
  const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));
  const matches = WEAR_WITH[seedId] ?? [];
  return matches
    .map((m, i) => {
      const product = byId[m.productId];
      if (!product) return null;
      return {
        product,
        reasonAr: m.reasonAr,
        reasonEn: m.reasonEn,
        score: 60 - i,
        ruleKey: `catalog-wear:${seedId}:${m.productId}`,
      } satisfies StyleSuggestion;
    })
    .filter(Boolean) as StyleSuggestion[];
}

export async function suggestMatch(seedProductId: string): Promise<StyleEngineResult> {
  const enabled = await isStyleEngineEnabled();
  if (!enabled) {
    return { enabled: false, source: "disabled", tool: "match", suggestions: [] };
  }

  const { products: catalog, source } = await loadCatalogProducts();
  const seed = catalog.find((p) => p.id === seedProductId) ?? catalog[0];
  if (!seed) {
    return { enabled: true, source, tool: "match", suggestions: [] };
  }

  const fromWear: StyleSuggestion[] = [];
  if (source === "db") {
    try {
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
    } catch {
      fromWear.push(...wearFromCatalog(seed.id, catalog));
    }
  } else {
    fromWear.push(...wearFromCatalog(seed.id, catalog));
  }

  if (fromWear.length >= 3) {
    return {
      enabled: true,
      source,
      tool: "match",
      suggestions: fromWear.slice(0, 6),
      meta: { seedProductId: seed.id },
    };
  }

  let colorPairs: Map<string, { reasonAr: string; reasonEn: string; weight: number }>;
  let fabricPairs: Map<string, { reasonAr: string; reasonEn: string; weight: number }>;

  if (source === "db") {
    try {
      const colorRules = await prisma.styleRule.findMany({
        where: { enabled: true, kind: "color_pair" },
      });
      const fabricRules = await prisma.styleRule.findMany({
        where: { enabled: true, kind: "fabric_pair" },
      });
      colorPairs = new Map(
        colorRules.map((r) => [
          `${r.sourceId}:${r.targetId}`,
          { reasonAr: r.reasonAr, reasonEn: r.reasonEn, weight: r.weight },
        ]),
      );
      fabricPairs = new Map(
        fabricRules.map((r) => [
          `${r.sourceId.toLowerCase()}:${r.targetId.toLowerCase()}`,
          { reasonAr: r.reasonAr, reasonEn: r.reasonEn, weight: r.weight },
        ]),
      );
      if (colorPairs.size === 0) {
        const fb = fallbackPairMaps();
        colorPairs = fb.colorPairs;
        fabricPairs = fb.fabricPairs;
      }
    } catch {
      const fb = fallbackPairMaps();
      colorPairs = fb.colorPairs;
      fabricPairs = fb.fabricPairs;
    }
  } else {
    const fb = fallbackPairMaps();
    colorPairs = fb.colorPairs;
    fabricPairs = fb.fabricPairs;
  }

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
    source,
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

  const { products: catalog, source } = await loadCatalogProducts();
  const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));

  if (source === "db") {
    try {
      const looks = await prisma.styleRule.findMany({
        where: { enabled: true, kind: "look" },
        orderBy: { weight: "desc" },
      });
      let chosen = looks[0];
      if (seedProductId) {
        chosen =
          looks.find((l) => {
            const meta = parseJson<{ productIds?: string[] }>(l.metaJson, {});
            return meta.productIds?.includes(seedProductId);
          }) ?? looks[0];
      }
      if (chosen) {
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
    } catch {
      /* fall through to catalog looks */
    }
  }

  let look =
    LOOKS.find((l) => seedProductId && l.productIds.includes(seedProductId)) ??
    LOOKS[0];
  const products = look.productIds
    .map((id) => byId[id])
    .filter(Boolean) as Product[];

  return {
    enabled: true,
    source: "catalog",
    tool: "complete",
    suggestions: products.map((p) => ({
      product: p,
      reasonAr: look.reasonAr,
      reasonEn: look.reasonEn,
      score: 20,
      ruleKey: `catalog-look:${look.id}`,
    })),
    look: {
      titleAr: look.titleAr,
      titleEn: look.titleEn,
      reasonAr: look.reasonAr,
      reasonEn: look.reasonEn,
      cover: look.cover,
      productIds: look.productIds,
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

  const { products: catalog, source } = await loadCatalogProducts();
  const pool =
    input.occasion === "street"
      ? catalog.filter((p) => p.gender === "men")
      : catalog.filter((p) => p.gender === "women");

  let reasonAr =
    "اخترنا قطعًا من الكتالوج تكتمل معًا دون تجاوز السقف";
  let reasonEn =
    "Catalog pieces chosen to complete together under your cap";
  let ruleKey: string | undefined;

  if (source === "db") {
    try {
      const templates = await prisma.styleRule.findMany({
        where: { enabled: true, kind: "template", sourceId: "budget" },
      });
      const tmpl = templates[0];
      if (tmpl) {
        reasonAr = tmpl.reasonAr;
        reasonEn = tmpl.reasonEn;
        ruleKey = tmpl.key;
      }
    } catch {
      /* keep defaults */
    }
  }

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
    source,
    tool: "budget",
    suggestions: pick.map((p) => ({
      product: p,
      reasonAr,
      reasonEn,
      score: 10,
      ruleKey,
    })),
    meta: { sum, budget: input.budget, occasion: input.occasion },
  };
}

export async function suggestColor(colorId: string): Promise<StyleEngineResult> {
  const enabled = await isStyleEngineEnabled();
  if (!enabled) {
    return { enabled: false, source: "disabled", tool: "color", suggestions: [] };
  }

  const { products: catalog, source } = await loadCatalogProducts();
  const related = new Set<string>([colorId]);

  let reasonAr =
    "محايدات أو تدرجات من نفس العائلة تُبقي الإطلالة هادئة";
  let reasonEn =
    "Neutrals or same-family tones keep the look calm";
  let ruleKey: string | undefined;

  if (source === "db") {
    try {
      const pairRules = await prisma.styleRule.findMany({
        where: {
          enabled: true,
          kind: "color_pair",
          OR: [{ sourceId: colorId }, { targetId: colorId }],
        },
      });
      for (const r of pairRules) {
        related.add(r.sourceId);
        related.add(r.targetId);
      }
      const tmpl = await prisma.styleRule.findFirst({
        where: { enabled: true, kind: "template", sourceId: "color" },
      });
      if (tmpl) {
        reasonAr = tmpl.reasonAr;
        reasonEn = tmpl.reasonEn;
        ruleKey = tmpl.key;
      }
    } catch {
      for (const pair of FALLBACK_COLOR_PAIRS) {
        if (pair.a === colorId) related.add(pair.b);
        if (pair.b === colorId) related.add(pair.a);
      }
    }
  } else {
    for (const pair of FALLBACK_COLOR_PAIRS) {
      if (pair.a === colorId) related.add(pair.b);
      if (pair.b === colorId) related.add(pair.a);
    }
  }

  const hits = catalog
    .filter((p) => p.colors.some((c) => related.has(c)))
    .slice(0, 6);

  return {
    enabled: true,
    source,
    tool: "color",
    suggestions: hits.map((p) => ({
      product: p,
      reasonAr,
      reasonEn,
      score: p.colors.includes(colorId) ? 20 : 12,
      ruleKey,
    })),
    meta: { colorId, related: [...related] },
  };
}
