"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Search } from "lucide-react";
import Link from "next/link";

export function AppHeader({ showSearch = true }: { showSearch?: boolean }) {
  const { t, toggleLocale, tn } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-[#f3f1ec]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/home" className="shrink-0">
          <span className="font-display text-[1.65rem] tracking-[0.02em] text-ink md:text-3xl">
            {tn("تنسيق", "Tansiq")}
          </span>
        </Link>
        {showSearch && (
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              className="h-10 rounded-full border-border/80 bg-card/80 pe-10 ps-9 text-sm shadow-none"
              readOnly
              onClick={() => {
                window.location.href = "/products";
              }}
            />
            <button
              type="button"
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
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
          className="shrink-0 text-xs text-muted-foreground"
        >
          {t("lang")}
        </Button>
      </div>
    </header>
  );
}
