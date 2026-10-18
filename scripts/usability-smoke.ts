/**
 * Phase 5 usability smoke — critical buyer/seller/admin paths.
 * Run: npm run test:pilot
 */
const base = process.env.BASE_URL || "http://127.0.0.1:4327";

async function mustOk(path: string, init?: RequestInit) {
  const res = await fetch(`${base}${path}`, init);
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  if (!res.ok) {
    throw new Error(`${path} → ${res.status} ${text.slice(0, 200)}`);
  }
  return { res, json, text };
}

async function main() {
  console.log("Pilot usability smoke against", base);

  await mustOk("/api/health");
  const health = (await mustOk("/api/health")).json as {
    ok: boolean;
    pilotCity: string;
    version: string;
  };
  console.log("health", health.ok, health.pilotCity, health.version);

  await mustOk("/api/products");
  await mustOk("/api/style/suggest?tool=match&seed=p1");
  await mustOk("/api/admin/overview");
  await mustOk("/api/pilot/config");

  const pages = [
    "/",
    "/home",
    "/products",
    "/products/p1",
    "/style",
    "/cart",
    "/protection",
    "/legal",
    "/pilot",
    "/admin",
    "/returns",
    "/account",
  ];
  for (const p of pages) {
    const { res } = await mustOk(p);
    console.log("page", p, res.status);
  }

  // Client error ingest
  const err = await mustOk("/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "usability-smoke probe",
      path: "/pilot",
      source: "smoke",
    }),
  });
  console.log("error ingest", (err.json as { id?: string }).id);

  // OTP → order path light check
  const send = await mustOk("/api/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "0555000111" }),
  });
  const sendBody = send.json as { challengeId: string; devCode?: string };
  const ver = await mustOk("/api/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challengeId: sendBody.challengeId,
      phone: "0555000111",
      code: sendBody.devCode || "1234",
    }),
  });
  const token = (ver.json as { token: string }).token;
  const products = (await mustOk("/api/products")).json as {
    items: { id: string; sizes: string[]; colors: string[] }[];
  };
  const product = products.items[0];
  const order = await mustOk("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "0555000111",
      city: "Riyadh",
      district: "Al Narjis",
      otpChallengeId: sendBody.challengeId,
      otpToken: token,
      lines: [
        {
          productId: product.id,
          size: product.sizes[0],
          colorId: product.colors[0],
          qty: 1,
        },
      ],
    }),
  });
  console.log("order", (order.json as { order: { id: string } }).order.id);

  console.log("USABILITY_SMOKE_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
