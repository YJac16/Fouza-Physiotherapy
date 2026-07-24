import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      display: "font-display text-display tracking-tight",
      h1: "font-display text-h1 tracking-tight",
      h2: "font-display text-h2 tracking-tight",
      h3: "font-display text-h3 tracking-tight",
      h4: "font-display text-h4 tracking-tight",
      h5: "font-display text-h5 tracking-tight",
      subtitle: "text-subtitle text-muted-foreground",
      "body-lg": "text-body-lg text-muted-foreground",
      body: "text-body",
      small: "text-small text-muted-foreground",
      caption: "text-caption uppercase text-muted-foreground",
      button: "text-sm font-semibold tracking-tight",
      nav: "text-[0.9375rem] font-medium tracking-tight",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"
  | "label";

const defaultElement: Record<
  NonNullable<VariantProps<typeof typographyVariants>["variant"]>,
  TypographyElement
> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  subtitle: "p",
  "body-lg": "p",
  body: "p",
  small: "p",
  caption: "span",
  button: "span",
  nav: "span",
};

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement;
}

function Typography({
  className,
  variant = "body",
  as,
  ...props
}: TypographyProps) {
  const Comp = as ?? defaultElement[variant ?? "body"];
  return (
    <Comp className={cn(typographyVariants({ variant }), className)} {...props} />
  );
}

export { Typography, typographyVariants };
