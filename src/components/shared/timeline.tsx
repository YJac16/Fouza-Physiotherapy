import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  icon?: ReactNode;
  href?: string;
}

export interface TimelineProps extends ComponentProps<"ol"> {
  items: TimelineItem[];
}

export function Timeline({ items, className, ...props }: TimelineProps) {
  return (
    <ol className={cn("relative space-y-8", className)} {...props}>
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-4 pl-2">
          {index < items.length - 1 ? (
            <span
              className="absolute left-[1.15rem] top-10 h-[calc(100%+0.5rem)] w-px bg-border"
              aria-hidden
            />
          ) : null}
          <div
            className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-accent-soft text-accent-soft-foreground"
            aria-hidden
          >
            {item.icon ?? (
              <span className="text-xs font-semibold">{index + 1}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {item.href ? (
                <Link
                  href={item.href}
                  className="font-display text-h5 tracking-tight text-foreground underline-offset-4 hover:underline"
                >
                  {item.title}
                </Link>
              ) : (
                <p className="font-display text-h5 tracking-tight text-foreground">
                  {item.title}
                </p>
              )}
              {item.meta ? (
                <span className="text-xs text-muted-foreground">{item.meta}</span>
              ) : null}
            </div>
            {item.description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
