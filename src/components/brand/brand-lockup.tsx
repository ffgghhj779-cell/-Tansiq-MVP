"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type BrandLockupProps = {
  href?: string | null;
  showSlogan?: boolean;
  /** light = ink on cream UI; inverse = white on dark hero */
  tone?: "light" | "inverse";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Prefer generated photo mark on large surfaces; SVG elsewhere for crispness */
  mark?: "svg" | "photo";
};

const sizeMap = {
  sm: { mark: 28, name: "text-[1.2rem] md:text-[1.35rem]", gap: "gap-2", slogan: "text-[9px] md:text-[10px]" },
  md: { mark: 34, name: "text-[1.45rem] md:text-[1.7rem]", gap: "gap-2.5", slogan: "text-[10px] md:text-[11px]" },
  lg: { mark: 56, name: "text-[2.1rem] md:text-[2.85rem]", gap: "gap-3.5", slogan: "text-[11px] md:text-[13px]" },
} as const;

function MarkSvg({
  size,
  tone,
}: {
  size: number;
  tone: "light" | "inverse";
}) {
  const ink = tone === "inverse" ? "#F7F2EA" : "#2A2622";
  const gold = "#C4A882";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className="shrink-0"
      aria-hidden
    >
      <circle cx="32" cy="32" r="29" stroke={ink} strokeWidth="1.25" opacity="0.3" fill="none" />
      <path
        d="M18 22.5c6.2-5.8 21.8-5.8 28 0"
        stroke={ink}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <path
        d="M20.5 26.5c5.2-4.2 17.8-4.2 23 0"
        stroke={gold}
        strokeWidth="1.65"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 23.5V46"
        stroke={ink}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M26 45.5h12"
        stroke={gold}
        strokeWidth="1.65"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function MarkPhoto({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-champagne/45"
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/tansiq-mark.jpg"
        alt=""
        fill
        sizes={`${size}px`}
        className="object-cover"
        priority
      />
    </span>
  );
}

export function BrandLockup({
  href = "/home",
  showSlogan = false,
  tone = "light",
  size = "md",
  className,
  mark = "svg",
}: BrandLockupProps) {
  const { t, tn } = useI18n();
  const s = sizeMap[size];

  const inner = (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      {mark === "photo" ? (
        <MarkPhoto size={s.mark} />
      ) : (
        <MarkSvg size={s.mark} tone={tone} />
      )}
      <span className="min-w-0 leading-none">
        <span
          className={cn(
            "block font-display tracking-[0.03em]",
            s.name,
            tone === "inverse" ? "text-white" : "text-ink",
          )}
        >
          {tn("تنسيق", "Tansiq")}
        </span>
        {showSlogan && (
          <span
            className={cn(
              "mt-1.5 block font-medium tracking-[0.16em]",
              s.slogan,
              tone === "inverse" ? "text-champagne/90" : "text-olive/90",
            )}
          >
            {t("tagline")}
          </span>
        )}
      </span>
    </span>
  );

  if (href === null) return inner;

  return (
    <Link
      href={href}
      className="pressable shrink-0"
      aria-label={`${tn("تنسيق", "Tansiq")} — ${t("tagline")}`}
    >
      {inner}
    </Link>
  );
}
