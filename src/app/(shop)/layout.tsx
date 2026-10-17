import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-5xl pb-24">
      <AppHeader />
      <main className="px-4 pt-4 md:px-6">{children}</main>
      <BottomNav />
    </div>
  );
}
