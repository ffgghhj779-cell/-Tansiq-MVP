"use client";

import { formatSar, getColor, getSeller } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { useI18n } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const { locale, tn } = useI18n();
  const { has, toggle } = useFavorites();
  const seller = getSeller(product.sellerId)!;
  const fav = has(product.id);

  return (
    <article className="group relative">
      <Link href={`/products/${product.id}`} className="pressable block">
        <div className="relative aspect-[3/4] overflow-hidden bg-mist product-shadow">
          <Image
            src={product.images[0]}
            alt={tn(product.titleAr, product.titleEn)}
            fill
            sizes="(max-width: 768px) 46vw, 220px"
            quality={75}
            className="object-cover transition-transform duration-500 ease-out md:group-hover:scale-[1.025]"
          />
        </div>
        <div className="mt-2 space-y-0.5 px-0.5">
          <p className="text-[13px] font-medium leading-snug tracking-tight text-ink line-clamp-2">
            {tn(product.titleAr, product.titleEn)}
          </p>
          <p className="text-[13px] text-ink/90">{formatSar(product.price, locale)}</p>
          <div className="flex items-center gap-1.5 pt-0.5">
            {product.colors.slice(0, 4).map((c) => {
              const color = getColor(c);
              return (
                <span
                  key={c}
                  className="size-2 rounded-full border border-black/8"
                  style={{ backgroundColor: color?.hex }}
                  title={color ? tn(color.ar, color.en) : c}
                />
              );
            })}
            <span className="ms-0.5 truncate text-[10px] tracking-wide text-muted-foreground">
              {tn(seller.nameAr, seller.nameEn)}
            </span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggle(product.id)}
        className="absolute end-1.5 top-1.5 flex size-9 items-center justify-center rounded-full bg-sand/90 shadow-sm ring-1 ring-border/50 transition active:scale-95"
        aria-label="Favorite"
      >
        <Heart
          className={`size-3.5 ${fav ? "fill-primary text-primary" : "text-ink/55"}`}
        />
      </button>
    </article>
  );
}
