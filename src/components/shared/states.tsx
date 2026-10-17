"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton() {
  const { t } = useI18n();
  return (
    <div className="space-y-4" aria-busy="true" aria-label={t("loading")}>
      <p className="text-sm text-muted-foreground">{t("loading")}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[3/4] w-full rounded-none bg-mist" />
            <Skeleton className="h-4 w-3/4 bg-mist" />
            <Skeleton className="h-3 w-1/2 bg-mist" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  actionLabel,
  onAction,
}: {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <p className="font-display text-2xl text-ink">{title}</p>
      {hint && <p className="max-w-xs text-sm text-muted-foreground">{hint}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2 rounded-full px-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-base font-medium text-ink">{t("error")}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="rounded-full">
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
