"use client";

import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { Home, Sparkles, Shirt, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", key: "navHome" as const, icon: Home },
  { href: "/style", key: "navStyle" as const, icon: Sparkles },
  { href: "/closet", key: "navCloset" as const, icon: Shirt },
  { href: "/cart", key: "navCart" as const, icon: ShoppingBag },
  { href: "/account", key: "navAccount" as const, icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { count } = useCart();

  return (
    <nav
      className="glass-bar fixed inset-x-0 bottom-0 z-40 border-t border-border/60"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pb-[max(env(safe-area-inset-bottom),6px)]">
        {items.map(({ href, key, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/home" && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "pressable relative flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 text-[10px] tracking-wide transition-colors duration-200",
                  active
                    ? "font-medium text-ink"
                    : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <Icon
                    className={cn(
                      "size-[22px] transition-transform duration-200",
                      active && "scale-105",
                    )}
                    strokeWidth={active ? 2.15 : 1.6}
                  />
                  {href === "/cart" && count > 0 && (
                    <span className="absolute -end-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                      {count}
                    </span>
                  )}
                </span>
                <span className={cn(active && "text-ink")}>{t(key)}</span>
                {active && (
                  <span className="absolute inset-x-6 bottom-1 h-px bg-champagne/80" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
