import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/shared/site-footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shop-shell relative mx-auto min-h-dvh max-w-5xl">
      <AppHeader />
      <main className="px-3.5 pt-3.5 md:px-6 md:pt-5">{children}</main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
