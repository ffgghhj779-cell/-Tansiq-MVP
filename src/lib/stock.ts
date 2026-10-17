import type { PrismaClient } from "@prisma/client";

export type StockMap = Record<string, number>;

export function parseStock(json: string): StockMap {
  try {
    return JSON.parse(json) as StockMap;
  } catch {
    return {};
  }
}

export function getAvailable(stock: StockMap, size: string) {
  return stock[size] ?? 0;
}

/**
 * Atomically validates and decrements stock for all lines.
 * Throws if any size is insufficient.
 */
export async function decrementStock(
  tx: Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
  >,
  lines: { productId: string; size: string; qty: number }[],
) {
  const needed = new Map<string, { size: string; qty: number }[]>();
  for (const line of lines) {
    const list = needed.get(line.productId) ?? [];
    list.push({ size: line.size, qty: line.qty });
    needed.set(line.productId, list);
  }

  for (const [productId, reqs] of needed) {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error(`Product missing: ${productId}`);

    const stock = parseStock(product.stockJson);
    for (const req of reqs) {
      const available = getAvailable(stock, req.size);
      if (available < req.qty) {
        throw new Error(
          `Insufficient stock for ${productId} size ${req.size} (have ${available}, need ${req.qty})`,
        );
      }
      stock[req.size] = available - req.qty;
    }

    await tx.product.update({
      where: { id: productId },
      data: { stockJson: JSON.stringify(stock) },
    });
  }
}
