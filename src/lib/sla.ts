import type { PrismaClient } from "@prisma/client";

/**
 * Recalculate seller deliveryScore from on-time vs late shipments.
 * Score = round(100 * onTime / (onTime + late)), floored at 50 when samples exist.
 */
export function scoreFromCounts(onTime: number, late: number) {
  const total = onTime + late;
  if (total === 0) return 90;
  return Math.max(50, Math.round((100 * onTime) / total));
}

export async function recordParcelTiming(
  tx: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  input: {
    sellerId: string;
    status: string;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
    previousStatus?: string;
  },
) {
  const seller = await tx.seller.findUnique({ where: { id: input.sellerId } });
  if (!seller) return;

  // Count SLA only when transitioning into shipped (uses slaHours from confirm→ship)
  // or into delivered. For demo we treat "shipped" after slaHours from now as late
  // only if shippedAt is set relative to order — simplified: mark late if status set
  // to shipped and tracking was delayed flag. Here: if delivered and shippedAt
  // exceeds slaHours from shippedAt→delivered, count late.
  let onTimeDelta = 0;
  let lateDelta = 0;

  if (
    input.status === "delivered" &&
    input.previousStatus !== "delivered" &&
    input.shippedAt &&
    input.deliveredAt
  ) {
    const hours =
      (input.deliveredAt.getTime() - input.shippedAt.getTime()) / (1000 * 60 * 60);
    if (hours <= seller.slaHours) onTimeDelta = 1;
    else lateDelta = 1;
  }

  // When marking shipped, no score change yet — wait for delivery.
  if (onTimeDelta === 0 && lateDelta === 0) return;

  const onTimeCount = seller.onTimeCount + onTimeDelta;
  const lateCount = seller.lateCount + lateDelta;
  await tx.seller.update({
    where: { id: seller.id },
    data: {
      onTimeCount,
      lateCount,
      deliveryScore: scoreFromCounts(onTimeCount, lateCount),
    },
  });
}

export function supportWhatsAppUrl(phoneE164?: string) {
  const raw =
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ||
    process.env.SUPPORT_WHATSAPP ||
    "966500000000";
  const digits = raw.replace(/\D/g, "");
  const text = encodeURIComponent(
    phoneE164
      ? `Hello Tansiq support — my phone is ${phoneE164}`
      : "Hello Tansiq support",
  );
  return `https://wa.me/${digits}?text=${text}`;
}
