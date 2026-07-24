import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { ArticleCard, CategoryBadge, RelatedArticles } from "@/components/blog";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/content/blog";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return buildMetadata({
      title: "Article Not Found | Fouza Physiotherapy",
      description: "The article you are looking for could not be found.",
      path: routes.marketing.blogPost(slug),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${post.title} | Fouza Physiotherapy Blog`,
    description: post.excerpt,
    path: routes.marketing.blogPost(post.slug),
    image: post.image,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const related = getRelatedPosts(post.slug, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Blog", path: routes.marketing.blog },
          { name: post.title, path: routes.marketing.blogPost(post.slug) },
        ])}
      />

      <PageHero
        title={post.title}
        description={post.excerpt}
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Blog", href: routes.marketing.blog },
          { label: post.title },
        ]}
      />

      <Section spacing="md">
        <Container size="md">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <CategoryBadge label={post.category} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" aria-hidden />
              {post.readTime}
            </span>
            <span className="text-xs text-muted-foreground">{post.date}</span>
          </div>

          <div className="mb-10 overflow-hidden rounded-[1.75rem] shadow-soft-lg">
            <Image
              src={post.image}
              alt={post.title}
              width={1100}
              height={620}
              priority
              className="aspect-[16/9] w-full object-cover"
            />
          </div>

          <div className="space-y-5">
            {post.body.map((paragraph, index) => (
              <Typography key={index} variant="body-lg">
                {paragraph}
              </Typography>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-6 text-center shadow-soft tablet:p-8">
            <Typography as="h2" variant="h4" className="text-balance">
              Ready to put this into practice?
            </Typography>
            <Typography variant="small" className="mx-auto mt-2 max-w-md">
              Book a consultation and get a personalised plan tailored to
              your goals.
            </Typography>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href={routes.booking.root}>Book appointment</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.marketing.blog}>Back to blog</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section spacing="md" tone="muted">
          <Container>
            <RelatedArticles>
              {related.map((item) => (
                <ArticleCard
                  key={item.slug}
                  title={item.title}
                  excerpt={item.excerpt}
                  category={item.category}
                  readTime={item.readTime}
                  date={item.date}
                  imageSrc={item.image}
                  href={routes.marketing.blogPost(item.slug)}
                />
              ))}
            </RelatedArticles>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
