import Link from "next/link";
import type { Metadata } from "next";

import { BlogExplorer } from "./blog-explorer";
import { FeaturedArticle } from "@/components/blog";
import { PageHero } from "@/components/marketing";
import { Newsletter } from "@/components/shared/newsletter";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { blogCategories, blogPosts, getFeaturedPost } from "@/content/blog";
import { listPublishedPosts } from "@/features/blog";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Blog | Fouza Physiotherapy",
  description:
    "Physiotherapy tips, recovery guidance, and evidence-based insight from Fouza Physiotherapy in Walmer Estate, Cape Town.",
  path: routes.marketing.blog,
});

export default async function BlogPage() {
  let cmsPosts: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    date: string;
    image: string;
    body: string[];
  }[] = [];

  try {
    const { data } = await listPublishedPosts();
    cmsPosts = (data ?? []).map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ?? "",
      category: "Insights",
      readTime: "5 min",
      date: (p.published_at ?? p.created_at ?? "").slice(0, 10),
      image: siteConfig.images.hero,
      body: (p.body_md ?? "").split("\n").filter(Boolean),
    }));
  } catch {
    cmsPosts = [];
  }

  const featuredStatic = getFeaturedPost();
  const featured = cmsPosts[0] ?? featuredStatic;

  const latest =
    cmsPosts.length > 0
      ? cmsPosts.slice(1)
      : blogPosts.filter((post) => post.slug !== featuredStatic?.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Blog", path: routes.marketing.blog },
        ])}
      />

      <PageHero
        title="Physiotherapy insights and recovery tips"
        description="Practical, evidence-based guidance to help you understand your body, recover well, and stay active for the long run."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Blog" },
        ]}
      />

      {featured ? (
        <Section spacing="md">
          <Container>
            <FeaturedArticle
              title={featured.title}
              excerpt={featured.excerpt}
              category={featured.category}
              readTime={featured.readTime}
              date={featured.date}
              imageSrc={
                "image" in featured && featured.image
                  ? featured.image
                  : siteConfig.images.hero
              }
              cta={
                <Button asChild>
                  <Link href={routes.marketing.blogPost(featured.slug)}>
                    Read full article
                  </Link>
                </Button>
              }
            />
          </Container>
        </Section>
      ) : null}

      <Section spacing="md" tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Latest articles"
            title="Browse by topic"
            description="Search or filter by category to find guidance relevant to you."
          />
          <BlogExplorer
            posts={latest.length ? latest : blogPosts}
            categories={blogCategories}
          />
        </Container>
      </Section>

      <Section spacing="md">
        <Container size="sm">
          <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-sm tablet:p-10">
            <Newsletter className="mx-auto max-w-sm" />
          </div>
        </Container>
      </Section>
    </>
  );
}
