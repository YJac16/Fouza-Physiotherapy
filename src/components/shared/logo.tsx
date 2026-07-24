import Image from "next/image";
import Link from "next/link";

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
  sm: { width: 140, height: 40, className: "h-9 w-auto" },
  md: { width: 180, height: 52, className: "h-11 w-auto" },
  lg: { width: 220, height: 64, className: "h-14 w-auto" },
};

const markSizeMap = {
  sm: { width: 36, height: 36, className: "size-9" },
  md: { width: 44, height: 44, className: "size-11" },
  lg: { width: 52, height: 52, className: "size-[3.25rem]" },
};

/** Circular brand mark — `fouza-physiotherapy-logo.png`. */
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
      className={cn("shrink-0 object-contain", className)}
      priority
    />
  );
}

/** Full official wordmark — mark + FOUZA / PHYSIOTHERAPY. */
function LogoWordmark({
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
      src={siteConfig.images.logoWordmark}
      alt={siteConfig.name}
      width={width}
      height={height}
      className={cn("shrink-0 object-contain object-left", className)}
      priority
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
      className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`${siteConfig.name} home`}
    >
      {content}
    </Link>
  );
}

export { LogoMark };
