export type Locale = "ar" | "en";
export type Gender = "women" | "men";

export type NamedColor = {
  id: string;
  ar: string;
  en: string;
  hex: string;
};

export type Seller = {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  rating: number;
  deliveryScore: number;
  returnDays: number;
};

export type Product = {
  id: string;
  slug: string;
  gender: Gender;
  titleAr: string;
  titleEn: string;
  price: number;
  compareAt?: number;
  sellerId: string;
  colors: string[];
  sizes: string[];
  fabricAr: string;
  fabricEn: string;
  fabricChips: string[];
  silhouetteAr: string;
  silhouetteEn: string;
  occasionAr: string;
  occasionEn: string;
  images: string[];
  descriptionAr: string;
  descriptionEn: string;
  modelHeight?: string;
  modelSize?: string;
  tags: string[];
  independent?: boolean;
  budgetFriendly?: boolean;
};

export type Look = {
  id: string;
  titleAr: string;
  titleEn: string;
  productIds: string[];
  reasonAr: string;
  reasonEn: string;
  cover: string;
};

export type StyleMatch = {
  productId: string;
  reasonAr: string;
  reasonEn: string;
};

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

export type Parcel = {
  sellerId: string;
  productIds: string[];
  status: OrderStatus;
  trackingNumber: string;
  deliveryFee: number;
  etaAr: string;
  etaEn: string;
};

export type Order = {
  id: string;
  placedAt: string;
  parcels: Parcel[];
  total: number;
  payment: "cod";
};
