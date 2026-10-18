import { prisma } from "../src/lib/prisma";
import { scoreFromCounts } from "../src/lib/sla";

async function main() {
  const overview = await prisma.returnRequest.count();
  const disputes = await prisma.dispute.count();
  const tickets = await prisma.supportTicket.count();
  const pending = await prisma.seller.count({ where: { status: "pending" } });
  console.log({ overview, disputes, tickets, pending });
  if (overview < 1 || disputes < 1 || tickets < 1 || pending < 1) {
    throw new Error("Seed trust samples missing");
  }
  if (scoreFromCounts(9, 1) !== 90) throw new Error("SLA score math");
  console.log("PHASE3_LIB_OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
