const base = process.env.BASE_URL || "http://127.0.0.1:4327";

async function main() {
  const sendRes = await fetch(`${base}/api/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "0555987654" }),
  });
  const send = await sendRes.json();
  console.log("otp/send", sendRes.status, send);
  if (!sendRes.ok) throw new Error("send failed");

  const verRes = await fetch(`${base}/api/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challengeId: send.challengeId,
      phone: "0555987654",
      code: send.devCode,
    }),
  });
  const ver = await verRes.json();
  console.log("otp/verify", verRes.status, ver);
  if (!verRes.ok) throw new Error("verify failed");

  const productsRes = await fetch(`${base}/api/products`);
  const products = await productsRes.json();
  const product = products.items?.[0] || products.products?.[0] || products[0];
  if (!product) throw new Error("no product from API");

  const sizes = product.sizes as string[];
  const colors = product.colors as string[];

  const orderRes = await fetch(`${base}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "0555987654",
      city: "Riyadh",
      district: "Al Narjis",
      shortAddress: "ABCD1234",
      nationalAddress: "",
      otpChallengeId: send.challengeId,
      otpToken: ver.token,
      lines: [
        {
          productId: product.id,
          size: sizes[0],
          colorId: colors[0],
          qty: 1,
        },
      ],
    }),
  });
  const orderBody = await orderRes.json();
  console.log("orders POST", orderRes.status, orderBody.order?.id || orderBody);
  if (!orderRes.ok) throw new Error("order failed");

  const trackRes = await fetch(`${base}/api/orders/${orderBody.order.id}`);
  const track = await trackRes.json();
  console.log(
    "orders GET",
    trackRes.status,
    track.order?.id,
    "notifications",
    track.order?.notifications?.length,
    "city",
    track.order?.city,
  );
  if (!trackRes.ok) throw new Error("track failed");
  console.log("PHASE2_HTTP_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
