"use client";

import { COLORS, PRODUCTS } from "@/lib/catalog";
import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function ClosetPage() {
  const { tn } = useI18n();
  const [items, setItems] = useState([
    { id: "c1", productId: "p5", labelAr: "حذاء أبيض", labelEn: "White sneakers" },
    { id: "c2", productId: "p2", labelAr: "جينز واسع", labelEn: "Wide denim" },
  ]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="font-display text-3xl text-ink">
          {tn("خزانتي", "My closet")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tn(
            "قطع تملكها فعلًا — لنقترح ما يلبس معها من الكتالوج.",
            "Pieces you already own — so we can match catalog items.",
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item) => {
          const p = PRODUCTS.find((x) => x.id === item.productId)!;
          return (
            <div key={item.id} className="space-y-2">
              <div className="relative aspect-[3/4] overflow-hidden bg-mist">
                <Image src={p.images[0]} alt="" fill className="object-cover" sizes="200px" />
              </div>
              <p className="text-sm font-medium">{tn(item.labelAr, item.labelEn)}</p>
              <Link href="/style?tool=match" className="text-xs text-olive underline-offset-4 hover:underline">
                {tn("ماذا يلبس معه؟", "What goes with this?")}
              </Link>
            </div>
          );
        })}
      </div>

      <section className="atmosphere-panel space-y-3 border border-border/50 p-5">
        <h2 className="font-display text-xl">{tn("أضف قطعة", "Add a piece")}</h2>
        <p className="text-sm text-muted-foreground">
          {tn("اختر نوعًا ولونًا من اللوحة (رفع صورة لاحقًا).", "Pick type + color from the palette (photo later).")}
        </p>
        <div className="flex flex-wrap gap-2">
          {COLORS.slice(0, 8).map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs"
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  {
                    id: `c${Date.now()}`,
                    productId: "p11",
                    labelAr: `قطعة ${c.ar}`,
                    labelEn: `${c.en} piece`,
                  },
                ])
              }
            >
              <span className="size-3 rounded-full" style={{ backgroundColor: c.hex }} />
              {tn(c.ar, c.en)}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
