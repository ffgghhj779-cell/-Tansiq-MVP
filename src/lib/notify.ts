import { prisma } from "./prisma";

export async function queueOrderConfirmation(input: {
  orderId: string;
  phone: string;
  total: number;
  parcelCount: number;
}) {
  const bodyAr = `تم تأكيد طلبك ${input.orderId}. الإجمالي ${input.total} ر.س — ${input.parcelCount} طرد. الدفع عند الاستلام.`;
  const bodyEn = `Order ${input.orderId} confirmed. Total SAR ${input.total} — ${input.parcelCount} parcel(s). Cash on delivery.`;

  const rows = await prisma.notification.createMany({
    data: [
      {
        orderId: input.orderId,
        channel: "whatsapp",
        to: input.phone,
        template: "order_confirmed",
        body: bodyAr,
        status: process.env.WHATSAPP_API_KEY ? "queued" : "simulated",
      },
      {
        orderId: input.orderId,
        channel: "in_app",
        to: input.phone,
        template: "order_confirmed",
        body: bodyEn,
        status: "delivered",
      },
    ],
  });

  return rows;
}
