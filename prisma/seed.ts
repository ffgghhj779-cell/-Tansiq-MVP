import { PrismaClient } from "@prisma/client";
import {
  PRODUCTS,
  SELLERS,
  SAMPLE_ORDERS,
  WEAR_WITH,
} from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.order.deleteMany();
  await prisma.otpChallenge.deleteMany();
  await prisma.product.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.report.deleteMany();
  await prisma.styleRule.deleteMany();

  for (const s of SELLERS) {
    await prisma.seller.create({
      data: {
        id: s.id,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        cityAr: s.cityAr,
        cityEn: s.cityEn,
        rating: s.rating,
        deliveryScore: s.deliveryScore,
        returnDays: s.returnDays,
        slaHours: 72,
        onTimeCount: Math.max(2, Math.round(s.deliveryScore / 20)),
        lateCount: s.deliveryScore >= 95 ? 0 : 1,
        verified: true,
        status: "approved",
      },
    });
  }

  await prisma.seller.create({
    data: {
      id: "s-pending",
      nameAr: "ورشة بانتظار",
      nameEn: "Pending Atelier",
      cityAr: "الرياض",
      cityEn: "Riyadh",
      rating: 0,
      deliveryScore: 90,
      returnDays: 7,
      slaHours: 72,
      verified: false,
      status: "pending",
    },
  });

  for (const p of PRODUCTS) {
    const stock: Record<string, number> = {};
    for (const size of p.sizes) stock[size] = 8;
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        gender: p.gender,
        titleAr: p.titleAr,
        titleEn: p.titleEn,
        price: p.price,
        compareAt: p.compareAt ?? null,
        sellerId: p.sellerId,
        colorsJson: JSON.stringify(p.colors),
        sizesJson: JSON.stringify(p.sizes),
        fabricAr: p.fabricAr,
        fabricEn: p.fabricEn,
        fabricChipsJson: JSON.stringify(p.fabricChips),
        silhouetteAr: p.silhouetteAr,
        silhouetteEn: p.silhouetteEn,
        occasionAr: p.occasionAr,
        occasionEn: p.occasionEn,
        imagesJson: JSON.stringify(p.images),
        descriptionAr: p.descriptionAr,
        descriptionEn: p.descriptionEn,
        modelHeight: p.modelHeight ?? null,
        modelSize: p.modelSize ?? null,
        tagsJson: JSON.stringify(p.tags),
        independent: !!p.independent,
        budgetFriendly: !!p.budgetFriendly,
        published: true,
        stockJson: JSON.stringify(stock),
      },
    });
  }

  for (const [productId, matches] of Object.entries(WEAR_WITH)) {
    for (const m of matches) {
      await prisma.styleRule.create({
        data: {
          key: `wear:${productId}:${m.productId}`,
          reasonAr: m.reasonAr,
          reasonEn: m.reasonEn,
          weight: 10,
          enabled: true,
        },
      });
    }
  }

  for (const order of SAMPLE_ORDERS) {
    await prisma.order.create({
      data: {
        id: order.id,
        phone: "0500000000",
        address: "Riyadh — Al Narjis",
        city: "Riyadh",
        district: "Al Narjis",
        shortAddress: "RRRD2929",
        nationalAddress: "",
        payment: "cod",
        status: order.parcels[0]?.status ?? "placed",
        total: order.total,
        otpVerified: true,
        confirmedAt: new Date(order.placedAt),
        createdAt: new Date(order.placedAt),
        parcels: {
          create: order.parcels.map((parcel) => ({
            sellerId: parcel.sellerId,
            status: parcel.status,
            trackingNumber: parcel.trackingNumber === "—" ? "" : parcel.trackingNumber,
            deliveryFee: parcel.deliveryFee,
            etaAr: parcel.etaAr,
            etaEn: parcel.etaEn,
            items: {
              create: parcel.productIds.map((pid) => {
                const product = PRODUCTS.find((x) => x.id === pid)!;
                return {
                  productId: pid,
                  size: product.sizes[0],
                  colorId: product.colors[0],
                  qty: 1,
                  unitPrice: product.price,
                };
              }),
            },
          })),
        },
        notifications: {
          create: [
            {
              channel: "in_app",
              to: "0500000000",
              template: "order_confirmed",
              body: `Order ${order.id} confirmed (seed).`,
              status: "delivered",
            },
          ],
        },
      },
    });
  }

  await prisma.report.create({
    data: {
      type: "listing",
      targetId: "p1",
      reason: "Color looks different (sample moderation queue)",
      status: "open",
    },
  });

  const sampleOrder = SAMPLE_ORDERS[0];
  if (sampleOrder) {
    const sellerId = sampleOrder.parcels[0]?.sellerId ?? "s1";
    const ret = await prisma.returnRequest.create({
      data: {
        orderId: sampleOrder.id,
        sellerId,
        reason: "size",
        notes: "Seed return for admin demo",
        status: "open",
        refundStatus: "pending",
        deadlineAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.dispute.create({
      data: {
        orderId: sampleOrder.id,
        returnId: ret.id,
        type: "return_sla",
        reason: "Seed dispute — seller response overdue (demo)",
        status: "open",
      },
    });
  }

  await prisma.supportTicket.create({
    data: {
      phone: "0500000000",
      channel: "in_app",
      subject: "Where is my parcel?",
      body: "Seed support ticket for Phase 3 admin inbox.",
      status: "open",
    },
  });

  console.log(
    `Seeded ${SELLERS.length + 1} sellers, ${PRODUCTS.length} products, ${SAMPLE_ORDERS.length} orders + Phase 3 trust samples`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
