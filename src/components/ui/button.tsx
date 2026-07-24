"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-220 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-soft active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
        outline:
          "border border-border bg-card text-foreground shadow-sm hover:bg-secondary hover:border-primary/25 active:scale-[0.98]",
        ghost: "text-foreground hover:bg-secondary hover:text-foreground",
        danger:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        success:
          "bg-success text-success-foreground shadow-sm hover:bg-success/90 active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 min-h-11 px-5 py-2.5",
        sm: "h-9 min-h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 min-h-12 rounded-xl px-7 text-base",
        icon: "size-11 min-h-11 min-w-11",
        "icon-sm": "size-9 min-h-9 min-w-9 rounded-lg",
        fab: "size-14 min-h-14 min-w-14 rounded-full shadow-soft-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex",
        orientation === "horizontal"
          ? "flex-row [&>button]:rounded-none [&>button:first-child]:rounded-l-xl [&>button:last-child]:rounded-r-xl [&>button:not(:first-child)]:border-l-0"
          : "flex-col [&>button]:rounded-none [&>button:first-child]:rounded-t-xl [&>button:last-child]:rounded-b-xl [&>button:not(:first-child)]:border-t-0",
        className,
      )}
      {...props}
    />
  );
}

export { Button, ButtonGroup, buttonVariants };
