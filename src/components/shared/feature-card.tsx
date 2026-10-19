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
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  titleAs = "h3",
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
      <CardContent className="flex flex-col gap-3 p-4 md:gap-4 md:p-6">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
          aria-hidden
        >
          {React.isValidElement(Icon) ? (
            Icon
          ) : (
            React.createElement(Icon as LucideIcon, { className: "size-5" })
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <Typography as={titleAs} variant="h5" className="break-words">
            {title}
          </Typography>
          <Typography variant="small" className="leading-relaxed break-words">
            {description}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}
