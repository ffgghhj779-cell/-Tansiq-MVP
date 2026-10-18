"use client";

import { ErrorReporter } from "@/components/error-reporter";
import { CartProvider } from "@/lib/cart";
import { FavoritesProvider } from "@/lib/favorites";
import { I18nProvider } from "@/lib/i18n";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <CartProvider>
        <FavoritesProvider>
          <ErrorReporter />
          {children}
        </FavoritesProvider>
      </CartProvider>
    </I18nProvider>
  );
}
