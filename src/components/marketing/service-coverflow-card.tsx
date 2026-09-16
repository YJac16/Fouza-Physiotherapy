import Image from "next/image";
import Link from "next/link";

import { marketingImageSizes } from "@/lib/images";
import { cn } from "@/lib/utils";

export type ServiceCoverflowCardProps = {
  href: string;
  image: string;
  imageAlt: string;
  title: string;
  qualifier: string;
  className?: string;
  sizes?: string;
};

/**
 * Catalogue tile: full-bleed clinic photo, rounded corners, two-line
 * sentence-case caption over a dark gradient scrim. Teal focus ring.
 */
export function ServiceCoverflowCard({
  href,
  image,
  imageAlt,
  title,
  qualifier,
  className,
  sizes = marketingImageSizes.coverflow,
}: ServiceCoverflowCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative isolate block aspect-[3/4] w-[min(68vw,16.5rem)] overflow-hidden rounded-[1.75rem] sm:w-[18rem] sm:rounded-[2rem]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes={sizes}
        className="object-cover"
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black via-black/78 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3 className="font-display text-[1.05rem] font-semibold leading-snug tracking-tight text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.85)] sm:text-xl">
          {title}
        </h3>
        <p className="mt-1.5 text-sm font-medium leading-snug tracking-[0.02em] text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.8)]">
          {qualifier}
        </p>
      </div>
    </Link>
  );
}
