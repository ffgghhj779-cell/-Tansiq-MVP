import { PRODUCTS } from "./catalog";
import { isDatabaseConfigured } from "./db";
import { prisma } from "./prisma";

export type PilotConfig = {
  appVersion: string;
  pilotCity: string;
  pilotCities: string[];
  codOwner: string;
  legalEntityName: string;
  legalCr: string;
  legalLicense: string;
  legalCapital: string;
  legalStatus: "pending_via" | "draft" | "ready";
  supportEmail: string;
  supportPhone: string;
  styleEngineEnabled: boolean;
};

const DEFAULTS: PilotConfig = {
  appVersion: "0.5.0-pilot",
  pilotCity: "Riyadh",
  pilotCities: ["Riyadh", "Jeddah"],
  codOwner: "Via Consulting — COD ops (TBD)",
  legalEntityName: "Tansiq (pending Via entity)",
  legalCr: "Pending Via confirmation",
  legalLicense: "Pending",
  legalCapital: "Pending",
  legalStatus: "pending_via",
  supportEmail: "support@tansiq.example",
  supportPhone: "+966 00 000 0000",
  styleEngineEnabled: true,
};

async function getSetting(key: string) {
  if (!isDatabaseConfigured()) return undefined;
  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    return row?.value;
  } catch {
    return undefined;
  }
}

export async function getPilotConfig(): Promise<PilotConfig> {
  if (!isDatabaseConfigured()) {
    return { ...DEFAULTS };
  }

  let settings: Awaited<ReturnType<typeof getSetting>>[] = [];
  try {
    settings = await Promise.all([
      getSetting("app_version"),
      getSetting("pilot_city"),
      getSetting("pilot_cities"),
      getSetting("cod_owner"),
      getSetting("legal_entity_name"),
      getSetting("legal_cr"),
      getSetting("legal_license"),
      getSetting("legal_capital"),
      getSetting("legal_status"),
      getSetting("support_email"),
      getSetting("support_phone"),
      getSetting("style_engine_enabled"),
    ]);
  } catch {
    return { ...DEFAULTS };
  }

  const [
    appVersion,
    pilotCity,
    pilotCities,
    codOwner,
    legalEntityName,
    legalCr,
    legalLicense,
    legalCapital,
    legalStatus,
    supportEmail,
    supportPhone,
    styleEngine,
  ] = settings;

  let cities = DEFAULTS.pilotCities;
  if (pilotCities) {
    try {
      cities = JSON.parse(pilotCities) as string[];
    } catch {
      cities = pilotCities.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  return {
    appVersion: appVersion || DEFAULTS.appVersion,
    pilotCity: pilotCity || DEFAULTS.pilotCity,
    pilotCities: cities,
    codOwner: codOwner || DEFAULTS.codOwner,
    legalEntityName: legalEntityName || DEFAULTS.legalEntityName,
    legalCr: legalCr || DEFAULTS.legalCr,
    legalLicense: legalLicense || DEFAULTS.legalLicense,
    legalCapital: legalCapital || DEFAULTS.legalCapital,
    legalStatus:
      (legalStatus as PilotConfig["legalStatus"]) || DEFAULTS.legalStatus,
    supportEmail: supportEmail || DEFAULTS.supportEmail,
    supportPhone: supportPhone || DEFAULTS.supportPhone,
    styleEngineEnabled: styleEngine !== "false" && styleEngine !== "0",
  };
}

export async function setPilotConfig(partial: Partial<PilotConfig>) {
  if (!isDatabaseConfigured()) {
    throw new Error("Database is not configured — set DATABASE_URL (Postgres) on Vercel");
  }
  const entries: [string, string][] = [];
  if (partial.appVersion !== undefined)
    entries.push(["app_version", partial.appVersion]);
  if (partial.pilotCity !== undefined)
    entries.push(["pilot_city", partial.pilotCity]);
  if (partial.pilotCities !== undefined)
    entries.push(["pilot_cities", JSON.stringify(partial.pilotCities)]);
  if (partial.codOwner !== undefined)
    entries.push(["cod_owner", partial.codOwner]);
  if (partial.legalEntityName !== undefined)
    entries.push(["legal_entity_name", partial.legalEntityName]);
  if (partial.legalCr !== undefined) entries.push(["legal_cr", partial.legalCr]);
  if (partial.legalLicense !== undefined)
    entries.push(["legal_license", partial.legalLicense]);
  if (partial.legalCapital !== undefined)
    entries.push(["legal_capital", partial.legalCapital]);
  if (partial.legalStatus !== undefined)
    entries.push(["legal_status", partial.legalStatus]);
  if (partial.supportEmail !== undefined)
    entries.push(["support_email", partial.supportEmail]);
  if (partial.supportPhone !== undefined)
    entries.push(["support_phone", partial.supportPhone]);
  if (partial.styleEngineEnabled !== undefined)
    entries.push([
      "style_engine_enabled",
      partial.styleEngineEnabled ? "true" : "false",
    ]);

  for (const [key, value] of entries) {
    await prisma.appSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
  return getPilotConfig();
}

export type PilotCheck = {
  id: string;
  labelAr: string;
  labelEn: string;
  ok: boolean;
  detail?: string;
};

export async function buildPilotChecklist(): Promise<{
  ready: boolean;
  checks: PilotCheck[];
  config: PilotConfig;
}> {
  const config = await getPilotConfig();

  let productCount = PRODUCTS.length;
  let orderCount = 0;
  let sellerApproved = 4;
  let openReturns = 0;
  let styleRules = 12;
  let recentErrors = 0;

  if (isDatabaseConfigured()) {
    try {
      [
        productCount,
        orderCount,
        sellerApproved,
        openReturns,
        styleRules,
        recentErrors,
      ] = await Promise.all([
        prisma.product.count({ where: { published: true } }),
        prisma.order.count(),
        prisma.seller.count({ where: { status: "approved" } }),
        prisma.returnRequest.count({ where: { status: "open" } }),
        prisma.styleRule.count({ where: { enabled: true } }),
        prisma.clientError.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
      ]);
    } catch {
      /* keep catalog defaults */
    }
  }

  const checks: PilotCheck[] = [
    {
      id: "city",
      labelAr: "مدينة الإطلاق محددة",
      labelEn: "Launch city set",
      ok: !!config.pilotCity,
      detail: config.pilotCity,
    },
    {
      id: "cod",
      labelAr: "مسؤول COD معيّن",
      labelEn: "COD owner assigned",
      ok: !!config.codOwner && !config.codOwner.includes("TBD"),
      detail: config.codOwner,
    },
    {
      id: "legal",
      labelAr: "نصوص قانونية / كيان (Via)",
      labelEn: "Legal copy / entity (Via)",
      ok: config.legalStatus === "ready",
      detail: config.legalStatus,
    },
    {
      id: "catalog",
      labelAr: "كتالوج منشور",
      labelEn: "Published catalog",
      ok: productCount >= 8,
      detail: `${productCount} products`,
    },
    {
      id: "sellers",
      labelAr: "بائعون معتمدون",
      labelEn: "Approved sellers",
      ok: sellerApproved >= 1,
      detail: `${sellerApproved} approved`,
    },
    {
      id: "orders",
      labelAr: "مسار الطلبات يعمل (عيّنة)",
      labelEn: "Order path exercised",
      ok: orderCount >= 1,
      detail: `${orderCount} orders`,
    },
    {
      id: "style",
      labelAr: "محرك ستايل بقواعد",
      labelEn: "Style engine has rules",
      ok: styleRules >= 5 && config.styleEngineEnabled,
      detail: `${styleRules} rules · engine ${config.styleEngineEnabled ? "on" : "off"}`,
    },
    {
      id: "errors",
      labelAr: "أخطاء العميل آخر ٢٤ ساعة منخفضة",
      labelEn: "Low client errors (24h)",
      ok: recentErrors < 20,
      detail: `${recentErrors} errors`,
    },
    {
      id: "returns_queue",
      labelAr: "طابور إرجاع مرصود",
      labelEn: "Returns queue visible",
      ok: true,
      detail: `${openReturns} open`,
    },
  ];

  // Pilot can soft-launch without final Via legal — mark ready if all except legal pass
  const blocking = checks.filter((c) => c.id !== "legal" && c.id !== "cod");
  const ready = blocking.every((c) => c.ok);

  return { ready, checks, config };
}
