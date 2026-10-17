"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Camera, Check, ImageIcon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  { id: "photos", ar: "صور", en: "Photos" },
  { id: "process", ar: "معالجة", en: "Process" },
  { id: "attrs", ar: "خصائص", en: "Attributes" },
  { id: "price", ar: "سعر ومقاس", en: "Price & size" },
  { id: "publish", ar: "نشر", en: "Publish" },
] as const;

export default function SellerUploadPage() {
  const { tn } = useI18n();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [approved, setApproved] = useState(false);
  const [quality, setQuality] = useState(62);
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [price, setPrice] = useState("189");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (step !== 1) return;
    setProcessing(true);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setProcessing(false);
          return 100;
        }
        return p + 8;
      });
    }, 180);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    let score = 55;
    if (approved) score += 18;
    if (sizes.length >= 3) score += 10;
    if (Number(price) > 0) score += 8;
    if (step >= 3) score += 5;
    setQuality(Math.min(98, score));
  }, [approved, sizes, price, step]);

  if (published) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent">
          <Check className="size-7 text-olive" />
        </div>
        <p className="font-display text-3xl text-ink">
          {tn("القائمة جاهزة للنشر", "Listing ready")}
        </p>
        <p className="text-sm text-muted-foreground">
          {tn(
            "درجة الجودة ظهرت مع نصائح بسيطة. في الإنتاج: موافقة على معالجة الصورة والاحتفاظ بالأصل.",
            "Quality score with plain tips. In production: approve processing and keep the original.",
          )}
        </p>
        <Button className="rounded-full" onClick={() => { setPublished(false); setStep(0); }}>
          {tn("ارفع منتجًا آخر", "Upload another")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10">
      <div>
        <p className="text-sm text-muted-foreground">
          {tn("بائع · من الجوال في أقل من دقيقة", "Seller · phone-first under a minute")}
        </p>
        <h1 className="font-display text-3xl text-ink">
          {tn("رفع منتج", "Upload product")}
        </h1>
      </div>

      <ol className="flex gap-1">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex-1">
            <div
              className={cn(
                "h-1 rounded-full",
                i <= step ? "bg-olive" : "bg-border",
              )}
            />
            <p
              className={cn(
                "mt-1.5 text-[10px]",
                i === step ? "font-medium text-ink" : "text-muted-foreground",
              )}
            >
              {tn(s.ar, s.en)}
            </p>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {["front", "back", "detail", "tag"].map((shot, i) => (
              <button
                key={shot}
                type="button"
                className="flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-border bg-card/50 text-muted-foreground transition hover:border-olive/50 hover:bg-accent/40"
              >
                {i === 0 ? (
                  <Camera className="size-7" />
                ) : (
                  <ImageIcon className="size-7" />
                )}
                <span className="text-xs">
                  {tn(
                    ["أمام", "خلف", "تفاصيل", "بطاقة عناية"][i],
                    ["Front", "Back", "Detail", "Care tag"][i],
                  )}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {tn(
              "إرشاد مسافة وزاوية وضوء — تحذير ضبابية في الإصدار الكامل.",
              "Distance, angle, light guides — blur warnings in full release.",
            )}
          </p>
          <Button className="w-full rounded-full" onClick={() => setStep(1)}>
            {tn("التقط / اختر صورًا (تجريبي)", "Capture / choose (demo)")}
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="atmosphere-panel space-y-3 border border-border/50 p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-olive" />
              {processing
                ? tn("نزيل الخلفية ونضبط الإضاءة…", "Removing background & correcting light…")
                : tn("جاهز للمراجعة", "Ready to review")}
            </div>
            <Progress value={progress} className="h-1.5" />
            {!processing && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="aspect-[3/4] bg-gradient-to-b from-stone-300 to-stone-100 p-3 text-center text-xs text-muted-foreground">
                    {tn("قبل", "Before")}
                  </div>
                  <div className="aspect-[3/4] bg-sand p-3 text-center text-xs text-muted-foreground shadow-inner ring-1 ring-border/40">
                    {tn("بعد — خلفية نظيفة", "After — clean bg")}
                  </div>
                </div>
                <Button
                  variant={approved ? "default" : "outline"}
                  className="w-full rounded-full"
                  onClick={() => setApproved(true)}
                >
                  {approved
                    ? tn("موافق على المعالجة ✓", "Processing approved ✓")
                    : tn("وافق على المعالجة", "Approve processing")}
                </Button>
              </>
            )}
          </div>
          <Button
            className="w-full rounded-full"
            disabled={processing || !approved}
            onClick={() => setStep(2)}
          >
            {tn("التالي", "Next")}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {tn(
              "اقتراحات مؤكَّدة منك قبل النشر — لا ننشر تخمينات وحدها.",
              "Suggestions you confirm before publish — no solo AI guesses.",
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {["قميص", "كتان", "عاجي", "واسع", "يومي"].map((chip, i) => (
              <span
                key={chip}
                className="rounded-full border border-olive/30 bg-accent px-3 py-1.5 text-sm"
              >
                {tn(chip, ["Shirt", "Linen", "Ivory", "Oversized", "Everyday"][i])} ✓
              </span>
            ))}
          </div>
          <Button className="w-full rounded-full" onClick={() => setStep(3)}>
            {tn("أكّد الخصائص", "Confirm attributes")}
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{tn("السعر (ر.س)", "Price (SAR)")}</Label>
            <Input
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-full text-lg"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label>{tn("المقاسات والمخزون", "Sizes & stock")}</Label>
            <div className="flex flex-wrap gap-2">
              {["XS", "S", "M", "L", "XL"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setSizes((prev) =>
                      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                    )
                  }
                  className={cn(
                    "min-w-11 rounded-full border px-3 py-2 text-sm",
                    sizes.includes(s)
                      ? "border-olive bg-olive text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full rounded-full" onClick={() => setStep(4)}>
            {tn("التالي", "Next")}
          </Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="atmosphere-panel border border-border/50 p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {tn("درجة جودة القائمة", "Listing quality score")}
                </p>
                <p className="font-display text-4xl text-ink">{quality}</p>
              </div>
              <Progress value={quality} className="h-2 w-28" />
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                {approved
                  ? tn("✓ خلفية نظيفة معتمدة", "✓ Clean background approved")
                  : tn("أضف موافقة المعالجة", "Approve processing")}
              </li>
              <li>
                {tn(
                  quality >= 80
                    ? "✓ صور كافية للبيع أسرع"
                    : "أضف صورة خلف لتبيع أسرع",
                  quality >= 80
                    ? "✓ Enough photos to sell faster"
                    : "Add a back photo to sell faster",
                )}
              </li>
              <li>{tn("✓ مقاسات متعددة", "✓ Multiple sizes")}</li>
            </ul>
          </div>
          <Button className="w-full rounded-full" onClick={() => setPublished(true)}>
            {tn("انشر القائمة", "Publish listing")}
          </Button>
        </div>
      )}
    </div>
  );
}
