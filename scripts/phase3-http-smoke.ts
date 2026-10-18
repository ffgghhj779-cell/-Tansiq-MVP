import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = process.env.BASE_URL || "http://127.0.0.1:4327";

async function main() {
  const order = await prisma.order.findFirst({ include: { parcels: true } });
  if (!order || !order.parcels[0]) throw new Error("no order");

  const ret = await fetch(`${base}/api/returns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: order.id,
      sellerId: order.parcels[0].sellerId,
      reason: "defect",
      notes: "phase3 http",
    }),
  });
  const retBody = await ret.json();
  console.log("return", ret.status, retBody.return?.id, retBody.return?.refundStatus, retBody.error);
  if (!ret.ok) throw new Error("return failed");

  const dispute = await fetch(`${base}/api/disputes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: order.id,
      returnId: retBody.return.id,
      type: "return_sla",
      reason: "phase3 dispute",
    }),
  });
  const dBody = await dispute.json();
  console.log("dispute", dispute.status, dBody.dispute?.id);
  if (!dispute.ok) throw new Error("dispute failed");

  const patch = await fetch(`${base}/api/returns`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: retBody.return.id,
      status: "approved",
      refundStatus: "refunded",
    }),
  });
  const pBody = await patch.json();
  console.log("refund", patch.status, pBody.return?.refundStatus);
  if (pBody.return?.refundStatus !== "refunded") throw new Error("refund not set");

  const ov = await fetch(`${base}/api/admin/overview`);
  const oBody = await ov.json();
  console.log("overview counts", oBody.counts);

  const admin = await fetch(`${base}/admin`);
  const prot = await fetch(`${base}/protection`);
  const protHtml = await prot.text();
  console.log("pages", admin.status, prot.status, protHtml.includes("WhatsApp"));
  if (admin.status !== 200 || prot.status !== 200) throw new Error("pages down");

  console.log("PHASE3_HTTP_OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
