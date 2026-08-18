import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

type BuildMetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  const base = siteConfig.url.replace(/\/$/, "");
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalised === "/" ? "" : normalised}`;
}

/** Strip a duplicated brand suffix so the root title template does not double it. */
export function shortPageTitle(title: string) {
  const suffix = ` | ${siteConfig.name}`;
  if (title === siteConfig.name) return title;
  return title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = siteConfig.images.og,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
  const titleText = shortPageTitle(title);
  const fullTitle =
    titleText === siteConfig.name ? siteConfig.name : `${titleText} | ${siteConfig.name}`;

  return {
    title: titleText,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_ZA",
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: titleText,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
