const base = process.env.BASE_URL || "http://127.0.0.1:4327";

async function main() {
  const match = await fetch(`${base}/api/style/suggest?tool=match&seed=p1`);
  const m = await match.json();
  console.log("match", match.status, m.enabled, m.suggestions?.length, m.suggestions?.[0]?.product?.id);

  const complete = await fetch(`${base}/api/style/suggest?tool=complete&seed=p1`);
  const c = await complete.json();
  console.log("complete", complete.status, c.look?.titleEn, c.suggestions?.length);

  const budget = await fetch(`${base}/api/style/suggest?tool=budget&budget=500&occasion=cafe`);
  const b = await budget.json();
  console.log("budget", budget.status, b.meta, b.suggestions?.length);

  const color = await fetch(`${base}/api/style/suggest?tool=color&color=olive`);
  const col = await color.json();
  console.log("color", color.status, col.suggestions?.length);

  const fb = await fetch(`${base}/api/style/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tool: "match",
      seedProductId: "p1",
      suggestedProductId: m.suggestions?.[0]?.product?.id || "p2",
      vote: "good",
    }),
  });
  const fbb = await fb.json();
  console.log("feedback", fb.status, fbb.feedback?.vote);

  const off = await fetch(`${base}/api/style/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: false }),
  });
  const offB = await off.json();
  const disabled = await (await fetch(`${base}/api/style/suggest?tool=match&seed=p1`)).json();
  console.log("disabled", offB.enabled, disabled.enabled, disabled.suggestions?.length);

  await fetch(`${base}/api/style/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: true }),
  });

  const settings = await (await fetch(`${base}/api/style/settings`)).json();
  console.log("settings", settings.enabled, settings.ruleCounts);

  if (!m.enabled || !m.suggestions?.length) throw new Error("match empty");
  if (!c.look) throw new Error("no look");
  if (disabled.enabled !== false) throw new Error("kill switch failed");
  if (!settings.enabled) throw new Error("re-enable failed");
  console.log("PHASE4_HTTP_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
