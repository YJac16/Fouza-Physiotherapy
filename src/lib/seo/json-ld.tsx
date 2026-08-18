import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo/metadata";

export function medicalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${absoluteUrl("/")}/#business`,
    name: siteConfig.practiceName,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    image: absoluteUrl(siteConfig.images.og),
    email: siteConfig.email,
    telephone: siteConfig.phone,
    priceRange: "R600–R900",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: siteConfig.googleBusiness.rating,
      reviewCount: siteConfig.googleBusiness.reviewCount,
      bestRating: 5,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "47 Upper Duke Street",
      addressLocality: "Walmer Estate, Cape Town",
      addressRegion: siteConfig.region,
      postalCode: siteConfig.postalCode,
      addressCountry: siteConfig.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lng,
    },
    openingHoursSpecification: siteConfig.hours
      .filter((h) => h.opens && h.closes)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: h.opens,
        closes: h.closes,
      })),
    founder: {
      "@type": "Person",
      name: siteConfig.founder.name,
      jobTitle: siteConfig.founder.title,
    },
    medicalSpecialty: "Physiotherapy",
    sameAs: [siteConfig.whatsappUrl, siteConfig.bookingExternalUrl].filter(
      Boolean,
    ),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(
  items: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
