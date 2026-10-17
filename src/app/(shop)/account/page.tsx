"use client";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PRODUCTS, SAMPLE_ORDERS, getProduct } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function AccountPage() {
  const { t, tn, toggleLocale } = useI18n();
  const { ids } = useFavorites();
  const favs = ids.map((id) => getProduct(id)).filter(Boolean);

  return (
    <div className="mx-auto max-w-lg space-y-8 pb-10">
      <div>
        <h1 className="font-display text-3xl text-ink">{t("navAccount")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tn("ضيف — احفظ أو اشترِ برمز الجوال", "Guest — save or buy with phone OTP")}
        </p>
      </div>

      <section className="atmosphere-panel space-y-3 border border-border/50 p-5">
        <h2 className="font-display text-xl">{t("sizeProfile")}</h2>
        <p className="text-sm text-muted-foreground">
          {tn("نساء · مقاس أعلى S · بنطلون ٢٧ · طول ١٦٥ سم", "Women · Top S · Pants 27 · Height 165 cm")}
        </p>
        <Button variant="outline" size="sm" className="rounded-full">
          {tn("عدّل", "Edit")}
        </Button>
      </section>

      <section className="atmosphere-panel space-y-3 border border-border/50 p-5">
        <h2 className="font-display text-xl">{t("styleProfile")}</h2>
        <div className="flex flex-wrap gap-2">
          {["محايدات", "طبقات", "واسع", "يومي"].map((tag, i) => (
            <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs">
              {tn(tag, ["Neutrals", "Layers", "Relaxed", "Everyday"][i])}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">{t("favorites")}</h2>
          <span className="text-xs text-muted-foreground">{favs.length}</span>
        </div>
        {favs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {tn("لا مفضلات بعد", "No favorites yet")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {favs.map((p) => p && <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">{t("orders")}</h2>
        {SAMPLE_ORDERS.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="flex items-center justify-between border border-border/50 bg-card/50 px-4 py-3 text-sm transition hover:bg-accent/40"
          >
            <span className="font-medium">{o.id}</span>
            <span className="text-muted-foreground">{t("track")}</span>
          </Link>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl">{t("closetStub")}</h2>
        <p className="text-sm text-muted-foreground">
          {tn(
            "أضف قطعًا تملكها من الكتالوج أو لونًا وقصة — قريبًا رفع صورة.",
            "Add owned pieces from the catalog or type + color — photo upload soon.",
          )}
        </p>
        <Link
          href="/closet"
          className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 text-sm hover:bg-muted"
        >
          {tn("افتح الخزانة", "Open closet")}
        </Link>
      </section>

      <Separator />

      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={toggleLocale}>
          {t("lang")}
        </Button>
        <Link href="/seller/upload" className="inline-flex h-7 items-center px-2 text-sm text-muted-foreground hover:text-foreground">
          {t("sellerUpload")}
        </Link>
        <Link href="/seller/orders" className="inline-flex h-7 items-center px-2 text-sm text-muted-foreground hover:text-foreground">
          {tn("طلبات البائع", "Seller orders")}
        </Link>
        <Link href="/admin" className="inline-flex h-7 items-center px-2 text-sm text-muted-foreground hover:text-foreground">
          {tn("الإدارة", "Admin")}
        </Link>
        <Link href="/onboarding" className="inline-flex h-7 items-center px-2 text-sm text-muted-foreground hover:text-foreground">
          {tn("التسجيل الأولي", "Onboarding")}
        </Link>
        <Link href="/protection" className="inline-flex h-7 items-center px-2 text-sm text-muted-foreground hover:text-foreground">
          {tn("حماية المشتري", "Buyer protection")}
        </Link>
        <Link href="/" className="inline-flex h-7 items-center px-2 text-sm text-muted-foreground hover:text-foreground">
          {tn("الصفحة التعريفية", "Marketing")}
        </Link>
      </div>

      <p className="text-xs text-muted-foreground">
        {tn(
          "تجريبي — لا مدفوعات حقيقية. الرياض وجدة أولًا.",
          "Demo — no real payments. Riyadh & Jeddah first.",
        )}
      </p>
      <p className="text-[10px] text-muted-foreground/80">
        {PRODUCTS.length} {tn("منتج وهمي في الكتالوج", "mock products in catalog")}
      </p>
    </div>
  );
}
