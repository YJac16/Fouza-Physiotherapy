import { ArrowRight, Star } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/* ── DoctorCard ── */

export interface DoctorCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  title: string;
  imageSrc?: string;
  imageAlt?: string;
  credentials?: string[];
  bio?: string;
  cta?: ReactNode;
}

export function DoctorCard({
  name,
  title,
  imageSrc,
  imageAlt,
  credentials = [],
  bio,
  cta,
  className,
  ...props
}: DoctorCardProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className={cn("overflow-hidden shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
        <Avatar className="size-16">
          {imageSrc ? (
            <AvatarImage src={imageSrc} alt={imageAlt ?? name} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle>{name}</CardTitle>
          <Typography variant="small">{title}</Typography>
          {credentials.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {credentials.map((credential) => (
                <Badge key={credential} variant="secondary">
                  {credential}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </CardHeader>
      {bio ? (
        <CardContent className="pt-0">
          <Typography variant="small" className="leading-relaxed">
            {bio}
          </Typography>
        </CardContent>
      ) : null}
      {cta ? <CardFooter className="pt-0">{cta}</CardFooter> : null}
    </Card>
  );
}

/* ── ServiceCard ── */

export interface ServiceCardProps extends HTMLAttributes<HTMLAnchorElement | HTMLDivElement> {
  title: string;
  description: string;
  icon?: ReactNode;
  href?: string;
  tag?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function ServiceCard({
  title,
  description,
  icon,
  href,
  tag,
  imageSrc,
  imageAlt,
  className,
  ...props
}: ServiceCardProps) {
  const content = (
    <>
      {imageSrc ? (
        <div className="aspect-[16/10] overflow-hidden rounded-t-2xl bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt ?? title}
            className="size-full object-cover transition-transform duration-350 ease-premium group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      ) : null}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {icon ? (
            <div
              className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground"
              aria-hidden
            >
              {icon}
            </div>
          ) : null}
          {tag ? <Badge variant="accent">{tag}</Badge> : null}
        </div>
        <CardTitle className="pt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Typography variant="small" className="leading-relaxed">
          {description}
        </Typography>
      </CardContent>
      {href ? (
        <CardFooter className="pt-0">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Learn more
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </CardFooter>
      ) : null}
    </>
  );

  const cardClassName = cn(
    "group h-full overflow-hidden shadow-sm transition-all duration-220 ease-premium hover:border-primary/20 hover:shadow-soft",
    href && "cursor-pointer",
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

/* ── ConditionCard ── */

export interface ConditionCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  summary: string;
  href?: string;
}

export function ConditionCard({
  name,
  summary,
  href,
  className,
  ...props
}: ConditionCardProps) {
  const inner = (
    <Card
      className={cn(
        "h-full shadow-sm transition-all duration-220 ease-premium hover:border-accent/30 hover:shadow-soft",
        href && "group cursor-pointer",
        className,
      )}
      {...(href ? {} : props)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-h5">{name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Typography variant="small" className="line-clamp-3 leading-relaxed">
          {summary}
        </Typography>
        {href ? (
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors group-hover:text-primary">
            View treatment
            <ArrowRight className="size-4" aria-hidden />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {inner}
      </a>
    );
  }

  return inner;
}

/* ── ReviewCard ── */

export interface ReviewCardProps extends HTMLAttributes<HTMLDivElement> {
  author: string;
  rating: number;
  content: string;
  date?: string;
  source?: string;
  avatarSrc?: string;
}

export function ReviewCard({
  author,
  rating,
  content,
  date,
  source,
  avatarSrc,
  className,
  ...props
}: ReviewCardProps) {
  const initials = author
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const clampedRating = Math.min(5, Math.max(0, rating));

  return (
    <Card className={cn("h-full shadow-sm", className)} {...props}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              {avatarSrc ? <AvatarImage src={avatarSrc} alt={author} /> : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <Typography as="p" variant="h5" className="text-base">
                {author}
              </Typography>
              {source ? (
                <Typography variant="caption" className="normal-case">
                  {source}
                </Typography>
              ) : null}
            </div>
          </div>
          {date ? (
            <Typography variant="caption" className="normal-case">
              {date}
            </Typography>
          ) : null}
        </div>
        <div
          className="flex items-center gap-0.5 pt-1"
          role="img"
          aria-label={`${clampedRating} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-4",
                i < clampedRating
                  ? "fill-warning text-warning"
                  : "fill-muted text-muted",
              )}
              aria-hidden
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <blockquote className="text-sm leading-relaxed text-foreground/90">
          &ldquo;{content}&rdquo;
        </blockquote>
      </CardContent>
    </Card>
  );
}
