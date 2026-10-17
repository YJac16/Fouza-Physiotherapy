import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import type { HTMLAttributes, ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SearchBar, type SearchBarProps } from "@/components/ui/search-bar";
import { Typography } from "@/components/ui/typography";
import { marketingImageSizes } from "@/lib/images";
import { cn } from "@/lib/utils";

/* ── CategoryBadge ── */

export interface CategoryBadgeProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  href?: string;
}

export function CategoryBadge({ label, href, className, ...props }: CategoryBadgeProps) {
  const badge = (
    <Badge
      variant="accent"
      className={cn(href && "transition-colors hover:bg-accent/20", className)}
      {...props}
    >
      {label}
    </Badge>
  );

  if (href) {
    return (
      <a
        href={href}
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {badge}
      </a>
    );
  }

  return badge;
}

/* ── ArticleCard ── */

export interface ArticleCardProps extends HTMLAttributes<HTMLAnchorElement | HTMLDivElement> {
  title: string;
  excerpt: string;
  category?: string;
  readTime?: string;
  date?: string;
  imageSrc?: string;
  imageAlt?: string;
  href?: string;
}

export function ArticleCard({
  title,
  excerpt,
  category,
  readTime,
  date,
  imageSrc,
  imageAlt,
  href,
  className,
  ...props
}: ArticleCardProps) {
  const content = (
    <>
      {imageSrc ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-t-2xl bg-secondary">
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            sizes={marketingImageSizes.card}
            className="object-cover transition-transform duration-350 ease-premium group-hover:scale-[1.02]"
          />
        </div>
      ) : null}
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {category ? <CategoryBadge label={category} /> : null}
          {readTime ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" aria-hidden />
              {readTime}
            </span>
          ) : null}
        </div>
        <CardTitle className="line-clamp-2 pt-1">{title}</CardTitle>
        {date ? <CardDescription>{date}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-0">
        <Typography variant="small" className="line-clamp-3 leading-relaxed">
          {excerpt}
        </Typography>
      </CardContent>
      {href ? (
        <CardFooter className="pt-0">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Read article
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </CardFooter>
      ) : null}
    </>
  );

  const cardClassName = cn(
    "group h-full overflow-hidden shadow-sm transition-all duration-220 ease-premium hover:border-primary/20 hover:shadow-soft",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          cardClassName,
          "block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        {...(props as HTMLAttributes<HTMLAnchorElement>)}
      >
        <Card className="h-full border-0 shadow-none">{content}</Card>
      </a>
    );
  }

  return (
    <Card className={cardClassName} {...(props as HTMLAttributes<HTMLDivElement>)}>
      {content}
    </Card>
  );
}

/* ── FeaturedArticle ── */

export interface FeaturedArticleProps extends HTMLAttributes<HTMLElement> {
  title: string;
  excerpt: string;
  category?: string;
  readTime?: string;
  date?: string;
  imageSrc?: string;
  imageAlt?: string;
  cta?: ReactNode;
}

export function FeaturedArticle({
  title,
  excerpt,
  category,
  readTime,
  date,
  imageSrc,
  imageAlt,
  cta,
  className,
  ...props
}: FeaturedArticleProps) {
  return (
    <article
      className={cn(
        "grid overflow-hidden rounded-2xl border border-border/80 bg-card shadow-soft md:grid-cols-2",
        className,
      )}
      {...props}
    >
      {imageSrc ? (
        <div className="relative aspect-[16/10] min-h-[12rem] bg-secondary md:aspect-auto md:h-full">
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            sizes={marketingImageSizes.detail}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="hidden bg-gradient-to-br from-primary/10 to-accent-soft md:block" aria-hidden />
      )}
      <div className="flex flex-col justify-center p-6 tablet:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {category ? <CategoryBadge label={category} /> : null}
          <Badge variant="default">Featured</Badge>
          {readTime ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" aria-hidden />
              {readTime}
            </span>
          ) : null}
        </div>
        <Typography as="h2" variant="h2" className="text-balance">
          {title}
        </Typography>
        {date ? (
          <Typography variant="caption" className="mt-2 normal-case">
            {date}
          </Typography>
        ) : null}
        <Typography variant="body-lg" className="mt-4 line-clamp-4">
          {excerpt}
        </Typography>
        {cta ? <div className="mt-6">{cta}</div> : null}
      </div>
    </article>
  );
}

/* ── RelatedArticles ── */

export interface RelatedArticlesProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  children: ReactNode;
}

export function RelatedArticles({
  title = "Related articles",
  children,
  className,
  ...props
}: RelatedArticlesProps) {
  return (
    <section className={cn("space-y-6", className)} aria-labelledby="related-articles-heading" {...props}>
      <Typography as="h2" id="related-articles-heading" variant="h3">
        {title}
      </Typography>
      <div className="grid gap-6 tablet:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

/* ── AuthorCard ── */

export interface AuthorCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  role?: string;
  bio?: string;
  imageSrc?: string;
  imageAlt?: string;
  social?: ReactNode;
}

export function AuthorCard({
  name,
  role,
  bio,
  imageSrc,
  imageAlt,
  social,
  className,
  ...props
}: AuthorCardProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <Avatar className="size-14">
          {imageSrc ? <AvatarImage src={imageSrc} alt={imageAlt ?? name} /> : null}
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-h5">{name}</CardTitle>
          {role ? <CardDescription>{role}</CardDescription> : null}
        </div>
      </CardHeader>
      {bio ? (
        <CardContent className="pt-0">
          <Typography variant="small" className="leading-relaxed">
            {bio}
          </Typography>
        </CardContent>
      ) : null}
      {social ? <CardFooter className="pt-0">{social}</CardFooter> : null}
    </Card>
  );
}

/* ── BlogSearch ── */

export interface BlogSearchProps extends SearchBarProps {
  label?: string;
}

export function BlogSearch({
  label = "Search articles",
  placeholder = "Search articles…",
  className,
  ...props
}: BlogSearchProps) {
  return (
    <SearchBar
      aria-label={label}
      placeholder={placeholder}
      className={cn("max-w-md", className)}
      {...props}
    />
  );
}
