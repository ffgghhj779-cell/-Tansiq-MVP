import { sendOtp, verifyOtp, assertOtpToken } from "../src/lib/otp";
import { prisma } from "../src/lib/prisma";
import { decrementStock, parseStock } from "../src/lib/stock";
import { queueOrderConfirmation } from "../src/lib/notify";

async function main() {
  const phone = "0555123456";
  const send = await sendOtp(phone);
  console.log("send", send);
  const code = send.devCode as string;
  const ver = await verifyOtp({ challengeId: send.challengeId, phone, code });
  console.log("verify", ver);
  if (!ver.ok) throw new Error("verify failed");
  console.log("token ok", assertOtpToken(send.challengeId, phone, ver.token));

  const bypass = await verifyOtp({
    challengeId: (await sendOtp(phone)).challengeId,
    phone,
    code: "1234",
  });
  console.log("bypass 1234", bypass.ok);

  const product = await prisma.product.findFirst();
  if (!product) throw new Error("no product");
  const sizes = JSON.parse(product.sizesJson) as string[];
  const colors = JSON.parse(product.colorsJson) as string[];
  const size = sizes[0];
  const before = parseStock(product.stockJson)[size];

  const orderId = `TQ-TEST-${Date.now()}`;
  const order = await prisma.$transaction(async (tx) => {
    await decrementStock(tx, [{ productId: product.id, size, qty: 1 }]);
    return tx.order.create({
      data: {
        id: orderId,
        phone,
        address: "Test St, Al Narjis, Riyadh",
        city: "Riyadh",
        district: "Al Narjis",
        shortAddress: "RRRD2929",
        nationalAddress: "",
        payment: "cod",
        status: "confirmed",
        total: product.price + 20,
        otpVerified: true,
        confirmedAt: new Date(),
        parcels: {
          create: [
            {
              sellerId: product.sellerId,
              status: "confirmed",
              deliveryFee: 20,
              etaAr: "٢–٤ أيام",
              etaEn: "2–4 days",
              items: {
                create: [
                  {
                    productId: product.id,
                    size,
                    colorId: colors[0],
                    qty: 1,
                    unitPrice: product.price,
                  },
                ],
              },
            },
          ],
        },
      },
      include: { parcels: true },
    });
  });
  await queueOrderConfirmation({
    orderId: order.id,
    phone,
    total: order.total,
    parcelCount: 1,
  });
  const afterProd = await prisma.product.findUnique({ where: { id: product.id } });
  const after = parseStock(afterProd!.stockJson)[size];
  const notes = await prisma.notification.count({ where: { orderId: order.id } });
  console.log({
    orderId: order.id,
    stockBefore: before,
    stockAfter: after,
    notifications: notes,
  });
  if (after !== before - 1) throw new Error("stock not decremented");
  console.log("PHASE2_LIB_OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
