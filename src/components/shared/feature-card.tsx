import type { LucideIcon } from "lucide-react";
import * as React from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon | ReactNode;
  title: string;
  description: string;
  titleAs?: "h2" | "h3" | "p";
  /** Below 640px, place the icon beside the copy. Wider screens stay stacked. */
  rowOnNarrow?: boolean;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  titleAs = "h3",
  rowOnNarrow = false,
  className,
  ...props
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group h-full overflow-hidden shadow-sm transition-shadow duration-220 ease-premium hover:shadow-soft",
        className,
      )}
      {...props}
    >
      <CardContent
        className={cn(
          "flex flex-col gap-3 p-4 md:gap-4 md:p-6",
          rowOnNarrow && "max-[639px]:flex-row max-[639px]:items-center max-[639px]:gap-3 max-[639px]:p-3",
        )}
      >
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary",
            rowOnNarrow && "max-[639px]:size-10",
          )}
          aria-hidden
        >
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            React.createElement(Icon as LucideIcon, { className: "size-5" })
          )}
        </div>
        <div className={cn("min-w-0 space-y-2", rowOnNarrow && "max-[639px]:space-y-0.5")}>
          <Typography
            as={titleAs}
            variant="h5"
            className={cn("break-words", rowOnNarrow && "max-[639px]:text-base max-[639px]:leading-snug")}
          >
            {title}
          </Typography>
          <Typography
            variant="small"
            className={cn(
              "leading-relaxed break-words",
              rowOnNarrow && "max-[639px]:text-[0.8125rem] max-[639px]:leading-snug",
            )}
          >
            {description}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
