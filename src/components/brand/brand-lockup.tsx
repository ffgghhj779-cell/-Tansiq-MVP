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
  sm: {
    mark: 32,
    name: "text-[1.15rem] leading-none md:text-[1.35rem]",
    gap: "gap-2",
    slogan: "text-[10px] leading-snug md:text-[11px]",
  },
  md: {
    mark: 40,
    name: "text-[1.45rem] leading-none md:text-[1.7rem]",
    gap: "gap-2.5",
    slogan: "text-[11px] leading-snug md:text-[12px]",
  },
  lg: {
    mark: 64,
    name: "text-[2.1rem] leading-none md:text-[2.85rem]",
    gap: "gap-3.5",
    slogan: "text-[13px] leading-snug md:text-[15px]",
  },
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
      {/* Soft fabric-ribbon T — distinctive, no outer circle */}
      <path
        d="M11 17c4.2-3.8 37.8-3.8 42 0-3.1 4.6-8.4 7.4-14.8 7.4H25.8C19.4 24.4 14.1 21.6 11 17Z"
        fill={ink}
      />
      <path
        d="M29.2 22.8h5.6v27.6c0 2.6-2.1 4.6-4.6 4.6h1.8c-2.2 0-4-1.8-4-4V22.8h1.2Z"
        fill={ink}
      />
      <path
        d="M15.5 19.8c8.2 2.4 24.8 2.4 33 0"
        stroke={gold}
        strokeWidth="2.35"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M36.2 25.5c5.4 4.1 8.6 10.2 8.2 17.2"
        stroke={gold}
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <path
        d="M24.8 14.2c5.6 1.2 8.8 1.2 14.4 0"
        stroke={gold}
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}

function MarkPhoto({ size }: { size: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/tansiq-mark.jpg"
        alt=""
        fill
        sizes={`${size}px`}
        className="object-contain object-center"
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
    <span
      className={cn(
        "inline-flex max-w-full items-start",
        s.gap,
        className,
      )}
    >
      {mark === "photo" ? (
        <MarkPhoto size={s.mark} />
      ) : (
        <MarkSvg size={s.mark} tone={tone} />
      )}
      <span className="min-w-0 flex-1 pt-0.5">
        <span
          className={cn(
            "block font-display tracking-[0.02em]",
            s.name,
            tone === "inverse" ? "text-white" : "text-ink",
          )}
        >
          {tn("تنسيق", "Tansiq")}
        </span>
        {showSlogan && (
          <span
            className={cn(
              "mt-1 block max-w-[16rem] font-medium tracking-[0.04em] text-pretty sm:max-w-none md:tracking-[0.1em]",
              s.slogan,
              tone === "inverse" ? "text-champagne" : "text-olive",
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
      className="pressable inline-flex max-w-full shrink min-w-0"
      aria-label={`${tn("تنسيق", "Tansiq")} — ${t("tagline")}`}
    >
      {inner}
    </Link>
  );
}
