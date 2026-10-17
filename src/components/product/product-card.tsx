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
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-mist product-shadow">
          <Image
            src={product.images[0]}
            alt={tn(product.titleAr, product.titleEn)}
            fill
            sizes="(max-width: 768px) 50vw, 240px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-2.5 space-y-1 px-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium leading-snug text-ink line-clamp-2">
              {tn(product.titleAr, product.titleEn)}
            </p>
          </div>
          <p className="text-sm text-ink">{formatSar(product.price, locale)}</p>
          <div className="flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((c) => {
              const color = getColor(c);
              return (
                <span
                  key={c}
                  className="size-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: color?.hex }}
                  title={color ? tn(color.ar, color.en) : c}
                />
              );
            })}
            <span className="ms-1 truncate text-[11px] text-muted-foreground">
              {tn(seller.nameAr, seller.nameEn)}
            </span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggle(product.id)}
        className="absolute end-2 top-2 rounded-full bg-card/80 p-1.5 backdrop-blur-sm transition hover:bg-card"
        aria-label="Favorite"
      >
        <Heart
          className={`size-4 ${fav ? "fill-olive text-olive" : "text-ink/70"}`}
        />
      </button>
    </article>
  );
}
