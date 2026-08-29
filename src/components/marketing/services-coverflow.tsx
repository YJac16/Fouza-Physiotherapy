import type { HTMLAttributes } from "react";

import { ServiceCard } from "@/components/marketing/cards";
import { ServiceCoverflowCard } from "@/components/marketing/service-coverflow-card";
import { SnapCoverflow } from "@/components/marketing/snap-coverflow";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { serviceHref, type ServiceContent } from "@/content/services";
import { cn } from "@/lib/utils";

export interface ServicesCoverflowProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  services: ServiceContent[];
  ariaLabel?: string;
}

function ServiceCards({ items }: { items: ServiceContent[] }) {
  return items.map((service) => {
    const Icon = service.icon;
    return (
      <ServiceCard
        key={service.slug}
        title={service.name}
        description={service.shortDescription}
        href={serviceHref(service.slug)}
        icon={<Icon className="size-5" />}
        imageSrc={service.image}
        imageAlt={service.imageAlt}
      />
    );
  });
}

/**
 * Services browse layer: snap-to-centre coverflow of in-clinic photos.
 * `prefers-reduced-motion` swaps to a static readable card grid (no autoplay).
 */
export function ServicesCoverflow({
  eyebrow,
  title,
  description,
  services,
  ariaLabel = "Physiotherapy services",
  className,
  ...props
}: ServicesCoverflowProps) {
  return (
    <Section spacing="md" className={cn("overflow-x-hidden", className)} {...props}>
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="hidden gap-6 motion-reduce:!grid tablet:grid-cols-2 lg:grid-cols-3">
          <ServiceCards items={services} />
        </div>
      </Container>

      <div className="motion-reduce:hidden">
        <SnapCoverflow ariaLabel={ariaLabel}>
          {services.map((service) => (
            <ServiceCoverflowCard
              key={service.slug}
              href={serviceHref(service.slug)}
              image={service.image}
              imageAlt={service.imageAlt}
              title={service.name}
              qualifier={service.qualifier}
            />
          ))}
        </SnapCoverflow>
        <p className="mt-1 px-5 text-center text-xs text-muted-foreground sm:px-6">
          Hover to pause · drag or swipe · arrow keys
        </p>
      </div>
    </Section>
  );
}
