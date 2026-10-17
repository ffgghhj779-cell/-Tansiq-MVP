"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

type ParcelRow = {
  id: string;
  status: string;
  trackingNumber: string;
  deliveryFee: number;
  order: { id: string; phone: string; createdAt: string };
  items: { qty: number; size: string; product: { titleAr: string; titleEn: string } }[];
};

export default function SellerOrdersPage() {
  const { tn } = useI18n();
  const [sellerId, setSellerId] = useState("s4");
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sellers/orders?sellerId=${id}`);
      const data = await res.json();
      setParcels(data.parcels || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(sellerId);
  }, [sellerId]);

  const ship = async (parcelId: string, orderId: string) => {
    const trackingNumber = tracking[parcelId] || `SMSA-${Date.now().toString().slice(-6)}`;
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parcelId,
        status: "shipped",
        trackingNumber,
      }),
    });
    await load(sellerId);
  };

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-10">
      <div>
        <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground">
          {tn("بائع", "Seller")}
        </p>
        <h1 className="font-display text-3xl text-ink">
          {tn("صندوق الطلبات", "Orders inbox")}
        </h1>
      </div>

      <div className="flex gap-2">
        {["s1", "s2", "s3", "s4", "s5"].map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSellerId(id)}
            className={`px-3 py-1.5 text-xs border ${
              sellerId === id ? "border-primary bg-accent" : "border-border"
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{tn("تحميل…", "Loading…")}</p>
      ) : parcels.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {tn("لا طلبات لهذا البائع بعد", "No parcels for this seller yet")}
        </p>
      ) : (
        <div className="space-y-4">
          {parcels.map((p) => (
            <div key={p.id} className="space-y-3 border border-border/60 bg-white/70 p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{p.order.id}</span>
                <span className="text-muted-foreground">{p.status}</span>
              </div>
              <ul className="text-xs text-muted-foreground">
                {p.items.map((item, i) => (
                  <li key={i}>
                    {tn(item.product.titleAr, item.product.titleEn)} · {item.size} · ×
                    {item.qty}
                  </li>
                ))}
              </ul>
              <Input
                placeholder={tn("رقم التتبع (إلزامي عند الشحن)", "Tracking # (required to ship)")}
                value={tracking[p.id] ?? p.trackingNumber}
                onChange={(e) =>
                  setTracking((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                className="rounded-none"
                dir="ltr"
              />
              <Button
                className="w-full rounded-none"
                disabled={p.status === "shipped" || p.status === "delivered"}
                onClick={() => void ship(p.id, p.order.id)}
              >
                {p.status === "shipped"
                  ? tn("تم الشحن", "Shipped")
                  : tn("علّم كمشحون + تتبع", "Mark shipped + tracking")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
