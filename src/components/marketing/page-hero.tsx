import Link from "next/link";

import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Container, Section } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

export interface PageHeroProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function PageHero({
  title,
  description,
  breadcrumbs,
  className,
}: PageHeroProps) {
  const crumbs: BreadcrumbItem[] = breadcrumbs ?? [
    { label: "Home", href: routes.marketing.home },
    { label: title },
  ];

  return (
    <Section tone="hero" spacing="sm" className={cn("border-b border-border/60", className)}>
      <Container>
        <Breadcrumbs items={crumbs} className="mb-6" />
        <Typography as="h1" variant="h1" className="max-w-3xl text-balance">
          {title}
        </Typography>
        {description ? (
          <Typography variant="body-lg" className="mt-4 max-w-2xl text-balance">
            {description}
          </Typography>
        ) : null}
      </Container>
    </Section>
  );
}

export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="font-medium text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
