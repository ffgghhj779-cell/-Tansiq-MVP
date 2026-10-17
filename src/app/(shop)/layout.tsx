import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-5xl pb-[calc(4.75rem+env(safe-area-inset-bottom))]">
      <AppHeader />
      <main className="px-3.5 pt-3.5 md:px-6 md:pt-5">{children}</main>
      <BottomNav />
    </div>
  );
}
