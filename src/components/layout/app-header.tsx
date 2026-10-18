"use client";

import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Camera, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const deskLinks = [
  { href: "/home", key: "navHome" as const },
  { href: "/style", key: "navStyle" as const },
  { href: "/closet", key: "navCloset" as const },
  { href: "/account", key: "navAccount" as const },
];

export function AppHeader({ showSearch = true }: { showSearch?: boolean }) {
  const { t, toggleLocale, tn } = useI18n();
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="glass-bar sticky top-0 z-40 border-b border-border/60 [transform:translateZ(0)]">
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
              className="h-10 rounded-full border-border/80 bg-sand/90 pe-10 ps-9 text-sm shadow-none"
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
        <nav
          className="ms-1 hidden items-center gap-0.5 md:flex"
          aria-label="Desktop"
        >
          {deskLinks.map(({ href, key }) => {
            const active =
              pathname === href ||
              (href !== "/home" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] tracking-wide transition-colors",
                  active
                    ? "bg-accent text-ink"
                    : "text-muted-foreground hover:text-ink",
                )}
              >
                {t(key)}
              </Link>
            );
          })}
          <Link
            href="/cart"
            className={cn(
              "relative ms-1 rounded-full p-2 transition-colors",
              pathname.startsWith("/cart")
                ? "bg-accent text-ink"
                : "text-muted-foreground hover:text-ink",
            )}
            aria-label={t("navCart")}
          >
            <ShoppingBag className="size-4" strokeWidth={1.7} />
            {count > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </nav>
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
