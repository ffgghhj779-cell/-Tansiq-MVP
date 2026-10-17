"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "./types";

type Dictionary = Record<string, { ar: string; en: string }>;

export const dict: Dictionary = {
  brand: { ar: "تنسيق", en: "Tansiq" },
  tagline: { ar: "الأسلوب أولًا، ثم التسوق", en: "Style first, then shop" },
  heroSupport: {
    ar: "اختاري اللون والقصة والقماش والمقاس — ثم اشتري بثقة.",
    en: "Choose color, cut, fabric, and fit — then buy with confidence.",
  },
  ctaShop: { ar: "تصفّح الإطلالات", en: "Browse looks" },
  ctaStyle: { ar: "جرّب مركز الستايل", en: "Try the Style hub" },
  ctaSeller: { ar: "ارفع منتجك من الجوال", en: "List from your phone" },
  navHome: { ar: "الرئيسية", en: "Home" },
  navStyle: { ar: "ستايل", en: "Style" },
  navCloset: { ar: "خزانتي", en: "Closet" },
  navCart: { ar: "السلة", en: "Cart" },
  navAccount: { ar: "الحساب", en: "Account" },
  search: { ar: "ابحث عن قطعة أو لون…", en: "Search a piece or color…" },
  looksToday: { ar: "إطلالات اليوم", en: "Looks for today" },
  underBudget: { ar: "تحت ميزانيتك", en: "Under your budget" },
  indie: { ar: "جديد من العلامات المستقلة", en: "New from independent labels" },
  trustDelivery: { ar: "توصيل واضح بالموعد", en: "Clear delivery dates" },
  trustReturns: { ar: "إرجاع خلال ٧ أيام", en: "Returns within 7 days" },
  trustProtect: { ar: "حماية المشتري", en: "Buyer protection" },
  wearWith: { ar: "يلبس معه", en: "Wear it with" },
  completeLook: { ar: "أكمل الإطلالة", en: "Complete the look" },
  addCart: { ar: "أضف للسلة", en: "Add to cart" },
  sizeRec: { ar: "مقترح لك", en: "Recommended" },
  fabricCare: { ar: "القماش والعناية", en: "Fabric & care" },
  sellerTrust: { ar: "البائع والثقة", en: "Seller & trust" },
  cartEmpty: { ar: "سلتك فارغة بعد", en: "Your cart is empty" },
  cartEmptyHint: {
    ar: "ابدأ من إطلالة اليوم أو اسأل مركز الستايل.",
    en: "Start from today’s look or ask the Style hub.",
  },
  checkout: { ar: "إتمام الطلب", en: "Checkout" },
  cod: { ar: "الدفع عند الاستلام", en: "Cash on delivery" },
  otpHint: {
    ar: "نرسل رمز تأكيد لرقم الجوال قبل تثبيت الطلب.",
    en: "We’ll send a confirmation code before locking the order.",
  },
  parcels: { ar: "الطرود حسب البائع", en: "Parcels by seller" },
  vat: { ar: "شامل ضريبة القيمة المضافة", en: "VAT included" },
  orders: { ar: "طلباتي", en: "Orders" },
  track: { ar: "تتبع", en: "Track" },
  returns: { ar: "إرجاع", en: "Return" },
  favorites: { ar: "المفضلة", en: "Favorites" },
  sizeProfile: { ar: "ملف المقاس", en: "Size profile" },
  styleProfile: { ar: "ملف الستايل", en: "Style profile" },
  closetStub: { ar: "خزانتي", en: "My closet" },
  loading: { ar: "نحضر القطع…", en: "Loading pieces…" },
  error: { ar: "تعذّر التحميل", en: "Couldn’t load" },
  retry: { ar: "أعد المحاولة", en: "Retry" },
  emptyList: { ar: "لا نتائج لهذه التصفية", en: "No results for this filter" },
  matchTool: { ar: "ماذا يلبس مع هذا؟", en: "What goes with this?" },
  budgetTool: { ar: "مساعد الميزانية", en: "Budget assistant" },
  colorTool: { ar: "باحث الألوان", en: "Color finder" },
  reason: { ar: "لماذا؟", en: "Why?" },
  seeAll: { ar: "الكل", en: "See all" },
  women: { ar: "نساء", en: "Women" },
  men: { ar: "رجال", en: "Men" },
  deliveryEta: { ar: "التوصيل المتوقع", en: "Estimated delivery" },
  returnWindow: { ar: "نافذة الإرجاع", en: "Return window" },
  days: { ar: "أيام", en: "days" },
  phone: { ar: "رقم الجوال", en: "Phone number" },
  sendOtp: { ar: "أرسل الرمز", en: "Send code" },
  confirmOrder: { ar: "أكّد الطلب", en: "Confirm order" },
  placeOrder: { ar: "اطلب الآن — دفع عند الاستلام", en: "Order — pay on delivery" },
  sellerUpload: { ar: "رفع منتج", en: "Upload product" },
  qualityScore: { ar: "درجة جودة القائمة", en: "Listing quality score" },
  marketingEnter: { ar: "ادخل التطبيق", en: "Enter the app" },
  lang: { ar: "English", en: "العربية" },
};

type I18nContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: (key: keyof typeof dict) => string;
  tn: (ar: string, en: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const t = useCallback(
    (key: keyof typeof dict) => dict[key][locale],
    [locale],
  );

  const tn = useCallback(
    (ar: string, en: string) => (locale === "ar" ? ar : en),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      dir: (locale === "ar" ? "rtl" : "ltr") as "rtl" | "ltr",
      setLocale,
      toggleLocale: () => setLocale((l) => (l === "ar" ? "en" : "ar")),
      t,
      tn,
    }),
    [locale, t, tn],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
