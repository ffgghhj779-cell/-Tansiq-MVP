"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct, getSeller } from "./catalog";

export type CartLine = {
  productId: string;
  size: string;
  colorId: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  /** False until localStorage has been read once */
  ready: boolean;
  add: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  remove: (productId: string, size: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  parcels: {
    sellerId: string;
    sellerNameAr: string;
    sellerNameEn: string;
    lines: CartLine[];
    deliveryFee: number;
    subtotal: number;
  }[];
  deliveryTotal: number;
  grandTotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tansiq-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (line) => {
      setLines((prev) => {
        const i = prev.findIndex(
          (l) => l.productId === line.productId && l.size === line.size,
        );
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], qty: next[i].qty + (line.qty ?? 1) };
          return next;
        }
        return [...prev, { ...line, qty: line.qty ?? 1 }];
      });
    };

    const remove = (productId: string, size: string) => {
      setLines((prev) =>
        prev.filter((l) => !(l.productId === productId && l.size === size)),
      );
    };

    const clear = () => setLines([]);

    const bySeller = new Map<string, CartLine[]>();
    for (const line of lines) {
      const p = getProduct(line.productId);
      if (!p) continue;
      const list = bySeller.get(p.sellerId) ?? [];
      list.push(line);
      bySeller.set(p.sellerId, list);
    }

    const parcels = Array.from(bySeller.entries()).map(([sellerId, sellerLines]) => {
      const seller = getSeller(sellerId)!;
      const subtotal = sellerLines.reduce((sum, l) => {
        const p = getProduct(l.productId)!;
        return sum + p.price * l.qty;
      }, 0);
      return {
        sellerId,
        sellerNameAr: seller.nameAr,
        sellerNameEn: seller.nameEn,
        lines: sellerLines,
        deliveryFee: 20 + Math.round(subtotal / 200) * 5,
        subtotal,
      };
    });

    const subtotal = parcels.reduce((s, p) => s + p.subtotal, 0);
    const deliveryTotal = parcels.reduce((s, p) => s + p.deliveryFee, 0);

    return {
      lines,
      ready: hydrated,
      add,
      remove,
      clear,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      parcels,
      deliveryTotal,
      grandTotal: subtotal + deliveryTotal,
    };
  }, [lines, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
