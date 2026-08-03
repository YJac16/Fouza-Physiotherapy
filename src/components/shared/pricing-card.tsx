import { Check } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export interface PricingCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta?: ReactNode;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  highlighted = false,
  badge,
  cta,
  className,
  ...props
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden shadow-sm transition-shadow duration-220 ease-premium hover:shadow-soft",
        highlighted && "border-primary/30 shadow-soft ring-1 ring-primary/15",
        className,
      )}
      {...props}
    >
      {badge ? (
        <Badge className="absolute -top-3 left-6" variant={highlighted ? "default" : "accent"}>
          {badge}
        </Badge>
      ) : null}
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        <div className="pt-2">
          <Typography as="p" variant="h3" className="inline text-primary">
            {price}
          </Typography>
          {period ? (
            <Typography as="span" variant="small" className="ml-1">
              / {period}
            </Typography>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3" aria-label={`${title} features`}>
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/90">
              <Check
                className="mt-0.5 size-4 shrink-0 text-success"
                aria-hidden
              />
              <span className="min-w-0 break-words">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      {cta ? <CardFooter className="pt-2">{cta}</CardFooter> : null}
    </Card>
  );
}
