import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full px-5 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-3xl",
      md: "max-w-5xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-none",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

function Container({ className, size, ...props }: ContainerProps) {
  return <div className={cn(containerVariants({ size }), className)} {...props} />;
}

const sectionVariants = cva("relative w-full", {
  variants: {
    spacing: {
      sm: "py-12 md:py-16",
      md: "py-16 md:py-24",
      lg: "py-20 md:py-28",
      none: "py-0",
    },
    tone: {
      default: "bg-background",
      muted: "bg-secondary/60",
      soft: "bg-accent-soft/40",
      hero: "bg-gradient-to-b from-secondary/80 via-background to-background",
      card: "bg-card",
    },
  },
  defaultVariants: {
    spacing: "md",
    tone: "default",
  },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

function Section({ className, spacing, tone, ...props }: SectionProps) {
  return <section className={cn(sectionVariants({ spacing, tone }), className)} {...props} />;
}

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 max-w-2xl space-y-3",
        align === "center" && "mx-auto text-center",
        className,
      )}
      {...props}
    >
      {eyebrow ? (
        <Typography variant="caption" className="text-accent">
          {eyebrow}
        </Typography>
      ) : null}
      <Typography as="h2" variant="h2" className="text-balance">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body-lg" className="text-balance">
          {description}
        </Typography>
      ) : null}
    </div>
  );
}

export { Container, Section, SectionHeader, containerVariants, sectionVariants };
