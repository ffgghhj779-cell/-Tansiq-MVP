"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatSar } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const { t, tn, locale } = useI18n();
  const { parcels, grandTotal, clear, lines } = useCart();
  const router = useRouter();
  const [phone, setPhone] = useState("05");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [address, setAddress] = useState("Riyadh — Al Narjis");
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lines.length === 0 && !confirmed) {
      router.replace("/cart");
    }
  }, [lines.length, confirmed, router]);

  if (lines.length === 0 && !confirmed) {
    return null;
  }

  if (confirmed && orderId) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <p className="font-display text-3xl text-ink">
          {tn("تم تأكيد طلبك", "Order confirmed")}
        </p>
        <p className="text-sm text-muted-foreground">
          {tn(
            "الطلب محفوظ في قاعدة البيانات — دفع عند الاستلام (OTP تجريبي).",
            "Order saved to the database — cash on delivery (demo OTP).",
          )}
        </p>
        <p className="text-xs tracking-wide text-champagne">{orderId}</p>
        <Button className="rounded-none" onClick={() => router.push(`/orders/${orderId}`)}>
          {t("track")}
        </Button>
      </div>
    );
  }

  const placeOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          address,
          lines: lines.map((l) => ({
            productId: l.productId,
            size: l.size,
            colorId: l.colorId,
            qty: l.qty,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOrderId(data.order.id);
      setConfirmed(true);
      clear();
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <h1 className="font-display text-3xl text-ink">{t("checkout")}</h1>

      <section className="atmosphere-panel space-y-3 border border-border/50 p-5">
        <p className="text-sm font-medium">{t("cod")}</p>
        <p className="text-xs text-muted-foreground">{t("otpHint")}</p>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-none"
            dir="ltr"
          />
        </div>
        {!otpSent ? (
          <Button
            variant="outline"
            className="rounded-none"
            onClick={() => setOtpSent(true)}
          >
            {t("sendOtp")}
          </Button>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="otp">{tn("رمز التأكيد (جرّب 1234)", "OTP (try 1234)")}</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="rounded-none"
              dir="ltr"
              maxLength={4}
            />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">{t("parcels")}</h2>
        {parcels.map((p) => (
          <div
            key={p.sellerId}
            className="flex justify-between border border-border/50 bg-card/50 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{tn(p.sellerNameAr, p.sellerNameEn)}</p>
              <p className="text-xs text-muted-foreground">
                {p.lines.length} {tn("قطعة", "items")} ·{" "}
                {tn("توصيل", "delivery")} {formatSar(p.deliveryFee, locale)}
              </p>
            </div>
            <p>{formatSar(p.subtotal + p.deliveryFee, locale)}</p>
          </div>
        ))}
      </section>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-base font-medium">
          <span>{tn("الإجمالي", "Total")}</span>
          <span>{formatSar(grandTotal, locale)}</span>
        </div>
        <p className="text-xs text-muted-foreground">{t("vat")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{tn("العنوان", "Address")}</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded-none"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        size="lg"
        className="w-full rounded-none"
        disabled={!otpSent || otp.length < 4 || submitting}
        onClick={() => void placeOrder()}
      >
        {submitting ? tn("جاري الحفظ…", "Saving…") : t("placeOrder")}
      </Button>
    </div>
  );
}
