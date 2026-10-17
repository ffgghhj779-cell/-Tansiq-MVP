"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Search } from "lucide-react";
import Link from "next/link";

export function AppHeader({ showSearch = true }: { showSearch?: boolean }) {
  const { t, toggleLocale, tn } = useI18n();

  return (
    <header className="glass-bar sticky top-0 z-30 border-b border-border/50">
      <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-3 py-2.5 md:gap-3 md:px-4 md:py-3">
        <Link href="/home" className="shrink-0 pressable">
          <span className="font-display text-[1.55rem] tracking-[0.03em] text-ink md:text-[1.85rem]">
            {tn("تنسيق", "Tansiq")}
          </span>
        </Link>
        {showSearch && (
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              className="h-10 rounded-full border-border/70 bg-white/80 pe-10 ps-9 text-sm shadow-none"
              readOnly
              onClick={() => {
                window.location.href = "/products";
              }}
            />
            <button
              type="button"
              className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted-foreground"
              aria-label="Visual search soon"
            >
              <Camera className="size-4" />
            </button>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLocale}
          className="h-9 shrink-0 px-2 text-[11px] tracking-wide text-muted-foreground"
        >
          {t("lang")}
        </Button>
      </div>
    </header>
  );
}
