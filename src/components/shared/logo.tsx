"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import * as React from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  /**
   * `wordmark` — full official logo (mark + FOUZA / PHYSIOTHERAPY).
   * `mark` — circular brand mark only (compact shells).
   */
  variant?: "wordmark" | "mark";
  /** @deprecated Prefer `variant="mark"`. Kept for call-site compatibility. */
  showMark?: boolean;
  /** @deprecated Prefer `variant`. Kept for call-site compatibility. */
  showName?: boolean;
}

const wordmarkSizeMap = {
  sm: { width: 168, height: 87, className: "h-9 w-auto max-w-[11rem]" },
  md: { width: 210, height: 109, className: "h-11 w-auto max-w-[14rem]" },
  lg: { width: 252, height: 131, className: "h-14 w-auto max-w-[16rem]" },
};

const markSizeMap = {
  sm: { width: 36, height: 36, className: "size-9" },
  md: { width: 44, height: 44, className: "size-11" },
  lg: { width: 52, height: 52, className: "size-[3.25rem]" },
};

/** Circular brand mark — transparent PNG. */
function LogoMark({
  className,
  width,
  height,
}: {
  className?: string;
  width: number;
  height: number;
}) {
  return (
    <Image
      src={siteConfig.images.logo}
      alt=""
      width={width}
      height={height}
      className={cn("shrink-0 bg-transparent object-contain", className)}
      priority
      unoptimized
    />
  );
}

/** Full official wordmark — mark + FOUZA / PHYSIOTHERAPY (theme-aware). */
function LogoWordmark({
  className,
  width,
  height,
}: {
  className?: string;
  width: number;
  height: number;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prefer dark wordmark once theme is known; default to light asset for SSR.
  const src =
    mounted && resolvedTheme === "dark"
      ? siteConfig.images.logoWordmarkDark
      : siteConfig.images.logoWordmark;

  return (
    <Image
      src={src}
      alt={siteConfig.name}
      width={width}
      height={height}
      className={cn("shrink-0 bg-transparent object-contain object-left", className)}
      priority
      unoptimized
    />
  );
}

export function Logo({
  href = "/",
  size = "md",
  className,
  variant,
  showMark = true,
  showName = true,
}: LogoProps) {
  const resolvedVariant: "wordmark" | "mark" =
    variant ?? (showMark && !showName ? "mark" : "wordmark");

  const content =
    resolvedVariant === "mark" ? (
      <LogoMark
        className={cn(markSizeMap[size].className, className)}
        width={markSizeMap[size].width}
        height={markSizeMap[size].height}
      />
    ) : (
      <LogoWordmark
        className={cn(wordmarkSizeMap[size].className, className)}
        width={wordmarkSizeMap[size].width}
        height={wordmarkSizeMap[size].height}
      />
    );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-lg bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`${siteConfig.name} home`}
    >
      {content}
    </Link>
  );
}

export { LogoMark };
