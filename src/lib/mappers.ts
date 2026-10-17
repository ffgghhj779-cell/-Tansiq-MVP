import type { Product as DbProduct, Seller as DbSeller } from "@prisma/client";
import type { Product, Seller } from "./types";

export function mapSeller(s: DbSeller): Seller {
  return {
    id: s.id,
    nameAr: s.nameAr,
    nameEn: s.nameEn,
    cityAr: s.cityAr,
    cityEn: s.cityEn,
    rating: s.rating,
    deliveryScore: s.deliveryScore,
    returnDays: s.returnDays,
  };
}

export function mapProduct(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    gender: p.gender as Product["gender"],
    titleAr: p.titleAr,
    titleEn: p.titleEn,
    price: p.price,
    compareAt: p.compareAt ?? undefined,
    sellerId: p.sellerId,
    colors: JSON.parse(p.colorsJson) as string[],
    sizes: JSON.parse(p.sizesJson) as string[],
    fabricAr: p.fabricAr,
    fabricEn: p.fabricEn,
    fabricChips: JSON.parse(p.fabricChipsJson) as string[],
    silhouetteAr: p.silhouetteAr,
    silhouetteEn: p.silhouetteEn,
    occasionAr: p.occasionAr,
    occasionEn: p.occasionEn,
    images: JSON.parse(p.imagesJson) as string[],
    descriptionAr: p.descriptionAr,
    descriptionEn: p.descriptionEn,
    modelHeight: p.modelHeight ?? undefined,
    modelSize: p.modelSize ?? undefined,
    tags: JSON.parse(p.tagsJson) as string[],
    independent: p.independent,
    budgetFriendly: p.budgetFriendly,
  };
}
