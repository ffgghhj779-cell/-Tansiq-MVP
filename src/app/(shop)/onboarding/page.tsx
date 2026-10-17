"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

const LOOKS = [
  { id: "neutral", ar: "محايدات هادئة", en: "Quiet neutrals" },
  { id: "layer", ar: "طبقات يومية", en: "Daily layers" },
  { id: "denim", ar: "جينز واسع", en: "Wide denim" },
  { id: "knit", ar: "تريكو مريح", en: "Easy knit" },
  { id: "street", ar: "ستريت محلي", en: "Local street" },
  { id: "work", ar: "عمل خفيف", en: "Soft work" },
];

export default function OnboardingPage() {
  const { tn } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<"women" | "men" | "both">("women");
  const [looks, setLooks] = useState<string[]>(["neutral", "layer"]);
  const [budget, setBudget] = useState(500);
  const [hijab, setHijab] = useState(false);

  const finish = () => {
    try {
      localStorage.setItem(
        "tansiq-onboarding",
        JSON.stringify({ audience, looks, budget, hijab, done: true }),
      );
    } catch {
      /* ignore */
    }
    router.push("/home");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-10 pt-2">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground">
          {tn("أقل من ٣٠ ثانية", "Under 30 seconds")}
        </p>
        <h1 className="font-display text-3xl text-ink">
          {tn("خلّينا نضبط ذوقك", "Let’s tune your style")}
        </h1>
      </div>

      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-border")}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">{tn("تسوق لـ", "Shopping for")}</p>
          {(
            [
              ["women", "نساء", "Women"],
              ["men", "رجال", "Men"],
              ["both", "كلاهما", "Both"],
            ] as const
          ).map(([id, ar, en]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAudience(id)}
              className={cn(
                "flex w-full items-center justify-between border px-4 py-3 text-sm",
                audience === id ? "border-primary bg-accent" : "border-border bg-sand/80",
              )}
            >
              {tn(ar, en)}
            </button>
          ))}
          <Button className="mt-2 w-full rounded-none" onClick={() => setStep(1)}>
            {tn("التالي", "Next")}
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {tn("اختَر ٣ إلى ٥ إطلالات", "Pick 3–5 looks")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {LOOKS.map((look) => {
              const on = looks.includes(look.id);
              return (
                <button
                  key={look.id}
                  type="button"
                  onClick={() =>
                    setLooks((prev) =>
                      on ? prev.filter((x) => x !== look.id) : [...prev, look.id],
                    )
                  }
                  className={cn(
                    "border px-3 py-4 text-sm",
                    on ? "border-primary bg-accent" : "border-border bg-sand/80",
                  )}
                >
                  {tn(look.ar, look.en)}
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={hijab}
              onChange={(e) => setHijab(e.target.checked)}
            />
            {tn("أرتدي حجابًا (اختياري — لا يُفترض أبدًا)", "I wear hijab (optional — never assumed)")}
          </label>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-none" onClick={() => setStep(0)}>
              {tn("رجوع", "Back")}
            </Button>
            <Button
              className="flex-1 rounded-none"
              disabled={looks.length < 3}
              onClick={() => setStep(2)}
            >
              {tn("التالي", "Next")}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">
            {tn("شريحة الميزانية", "Budget band")}: {budget} SAR
          </p>
          <input
            type="range"
            min={200}
            max={1200}
            step={50}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-[var(--champagne)]"
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-none" onClick={() => setStep(1)}>
              {tn("رجوع", "Back")}
            </Button>
            <Button className="flex-1 rounded-none" onClick={finish}>
              {tn("ابدأ التسوق", "Start shopping")}
            </Button>
          </div>
          <button type="button" className="w-full text-xs text-muted-foreground" onClick={finish}>
            {tn("تخطّى — تصفح كزائر", "Skip — browse as guest")}
          </button>
        </div>
      )}
    </div>
  );
}
