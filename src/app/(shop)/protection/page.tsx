"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supportWhatsAppUrl } from "@/lib/support";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function BuyerProtectionPage() {
  const { tn } = useI18n();
  const [phone, setPhone] = useState("05");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const wa = useMemo(() => supportWhatsAppUrl(phone), [phone]);

  const items = [
    {
      ar: "تتبع واضح لكل طرد وبائع",
      en: "Clear tracking per parcel and seller",
    },
    {
      ar: "إرجاع خلال ٧ أيام مع حالة استرداد في النظام",
      en: "Returns within 7 days with refund status in the system",
    },
    {
      ar: "تأكيد الطلب برمز الجوال قبل تثبيت الدفع عند الاستلام",
      en: "Phone confirmation before locking cash-on-delivery orders",
    },
    {
      ar: "تصعيد نزاع + تذكرة دعم إذا تأخر البائع",
      en: "Dispute escalation + support ticket if a seller is late",
    },
  ];

  const openTicket = async () => {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          subject: subject || "Buyer protection help",
          body: body || "Need help with an order",
          channel: "in_app",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTicketId(data.ticket.id);
    } catch (e) {
      setError(String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <p className="text-xs tracking-[0.2em] uppercase text-champagne">
          {tn("ثقة", "Trust")}
        </p>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          {tn("حماية المشتري", "Buyer protection")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tn(
            "وعود ظاهرة قبل الشراء — الدعم عبر واتساب أو تذكرة داخلية.",
            "Visible promises before purchase — support via WhatsApp or an in-app ticket.",
          )}
        </p>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.en}
            className="border border-border/60 bg-sand/80 px-4 py-3 text-sm text-ink"
          >
            {tn(item.ar, item.en)}
          </li>
        ))}
      </ul>

      <section className="atmosphere-panel space-y-3 border border-border/50 p-5">
        <h2 className="font-display text-xl">{tn("الدعم", "Support")}</h2>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 w-full items-center justify-center rounded-full bg-[#25D366]/90 px-4 text-sm font-medium text-ink"
        >
          {tn("واتساب الدعم", "WhatsApp support")}
        </a>
        <div className="space-y-2">
          <Label htmlFor="phone">{tn("جوالك", "Your phone")}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-none bg-sand/70"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">{tn("الموضوع", "Subject")}</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-none bg-sand/70"
            placeholder={tn("مشكلة في طلب", "Issue with an order")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body">{tn("التفاصيل", "Details")}</Label>
          <Textarea
            id="body"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="resize-none bg-sand/70"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {ticketId ? (
          <p className="text-sm text-olive">
            {tn("تم فتح التذكرة", "Ticket opened")}: {ticketId}
          </p>
        ) : (
          <Button
            className="w-full rounded-full"
            disabled={sending}
            onClick={() => void openTicket()}
          >
            {sending
              ? tn("جاري الإرسال…", "Sending…")
              : tn("افتح تذكرة داخلية", "Open internal ticket")}
          </Button>
        )}
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/returns" className="text-olive underline-offset-4 hover:underline">
          {tn("طلب إرجاع", "Start a return")}
        </Link>
        <Link href="/home" className="text-olive underline-offset-4 hover:underline">
          {tn("العودة للتسوق", "Back to shopping")}
        </Link>
        <Link href="/admin" className="text-muted-foreground underline-offset-4 hover:underline">
          {tn("لوحة الإدارة", "Admin console")}
        </Link>
      </div>
    </div>
  );
}
