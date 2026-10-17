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
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [city, setCity] = useState("Riyadh");
  const [district, setDistrict] = useState("Al Narjis");
  const [shortAddress, setShortAddress] = useState("");
  const [nationalAddress, setNationalAddress] = useState("");
  const [street, setStreet] = useState("");

  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [notifyPreview, setNotifyPreview] = useState<string | null>(null);
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
      <div className="mx-auto max-w-md space-y-5 py-16 text-center">
        <p className="font-display text-3xl text-ink">
          {tn("تم تأكيد طلبك", "Order confirmed")}
        </p>
        <p className="text-sm text-muted-foreground">
          {tn(
            "تم التحقق من الجوال وتثبيت المخزون. الدفع عند الاستلام.",
            "Phone verified and stock reserved. Cash on delivery.",
          )}
        </p>
        <p className="text-xs tracking-wide text-champagne">{orderId}</p>
        {notifyPreview && (
          <p className="atmosphere-panel mx-auto max-w-sm border border-border/50 px-4 py-3 text-start text-xs text-muted-foreground">
            {notifyPreview}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            className="rounded-none"
            onClick={() => router.push(`/orders/${orderId}`)}
          >
            {t("track")}
          </Button>
          <Button
            variant="outline"
            className="rounded-none"
            onClick={() => router.push("/products")}
          >
            {tn("تابع التسوّق", "Keep shopping")}
          </Button>
        </div>
      </div>
    );
  }

  const sendCode = async () => {
    setSendingOtp(true);
    setError(null);
    setOtpVerified(false);
    setOtpToken(null);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "order" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP send failed");
      setChallengeId(data.challengeId);
      setDevCode(data.devCode ?? null);
      setOtp("");
    } catch (e) {
      setError(String(e));
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyCode = async () => {
    if (!challengeId) return;
    setVerifyingOtp(true);
    setError(null);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verify failed");
      setOtpToken(data.token);
      setOtpVerified(true);
    } catch (e) {
      setError(String(e));
      setOtpVerified(false);
      setOtpToken(null);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const placeOrder = async () => {
    if (!challengeId || !otpToken) return;
    setSubmitting(true);
    setError(null);
    try {
      const addressLine = [street, district, city].filter(Boolean).join(", ");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          address: addressLine,
          city,
          district,
          shortAddress,
          nationalAddress,
          otpChallengeId: challengeId,
          otpToken,
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
      const note = data.order.notifications?.find(
        (n: { channel: string }) => n.channel === "in_app",
      );
      setNotifyPreview(note?.body ?? null);
      setConfirmed(true);
      clear();
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const addressReady = city.trim().length > 0 && district.trim().length > 0;

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
            onChange={(e) => {
              setPhone(e.target.value);
              setChallengeId(null);
              setOtpVerified(false);
              setOtpToken(null);
            }}
            className="rounded-none"
            dir="ltr"
          />
        </div>
        {!challengeId ? (
          <Button
            variant="outline"
            className="rounded-none"
            disabled={phone.replace(/\s/g, "").length < 9 || sendingOtp}
            onClick={() => void sendCode()}
          >
            {sendingOtp ? tn("جاري الإرسال…", "Sending…") : t("sendOtp")}
          </Button>
        ) : otpVerified ? (
          <p className="text-xs font-medium text-olive">
            {tn("تم التحقق من الجوال", "Phone verified")}
          </p>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="otp">
              {tn("رمز التأكيد", "Confirmation code")}
              {devCode ? ` · demo ${devCode}` : " · try 1234"}
            </Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="rounded-none"
              dir="ltr"
              maxLength={4}
            />
            <div className="flex gap-2">
              <Button
                className="rounded-none"
                disabled={otp.length < 4 || verifyingOtp}
                onClick={() => void verifyCode()}
              >
                {verifyingOtp
                  ? tn("جاري التحقق…", "Verifying…")
                  : tn("تحقق", "Verify")}
              </Button>
              <Button
                variant="outline"
                className="rounded-none"
                disabled={sendingOtp}
                onClick={() => void sendCode()}
              >
                {tn("أعد الإرسال", "Resend")}
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className="atmosphere-panel space-y-3 border border-border/50 p-5">
        <h2 className="text-sm font-medium">
          {tn("عنوان التوصيل", "Delivery address")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {tn(
            "المدينة والحي مطلوبان. الرمز الوطني اختياري للتجربة.",
            "City and district required. National address code optional for the demo.",
          )}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">{tn("المدينة", "City")}</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">{tn("الحي", "District")}</Label>
            <Input
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="rounded-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="street">{tn("الشارع / المبنى", "Street / building")}</Label>
          <Input
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="rounded-none"
            placeholder={tn("اختياري", "Optional")}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shortAddress">
              {tn("العنوان المختصر", "Short address")}
            </Label>
            <Input
              id="shortAddress"
              value={shortAddress}
              onChange={(e) => setShortAddress(e.target.value)}
              className="rounded-none"
              dir="ltr"
              placeholder="RRRD2929"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nationalAddress">
              {tn("العنوان الوطني", "National address")}
            </Label>
            <Input
              id="nationalAddress"
              value={nationalAddress}
              onChange={(e) => setNationalAddress(e.target.value)}
              className="rounded-none"
              dir="ltr"
              placeholder="Optional"
            />
          </div>
        </div>
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        size="lg"
        className="w-full rounded-none"
        disabled={!otpVerified || !addressReady || submitting}
        onClick={() => void placeOrder()}
      >
        {submitting ? tn("جاري الحفظ…", "Saving…") : t("placeOrder")}
      </Button>
    </div>
  );
}
