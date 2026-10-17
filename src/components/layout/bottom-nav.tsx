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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-[#f3f1ec]/92 backdrop-blur-md"
      aria-label="Main"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ href, key, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/home" && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] transition-colors",
                  active
                    ? "text-olive font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  {href === "/cart" && count > 0 && (
                    <span className="absolute -end-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 text-[10px] text-primary-foreground">
                      {count}
                    </span>
                  )}
                </span>
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
