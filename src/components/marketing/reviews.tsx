import { Star } from "lucide-react";
import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { ReviewCard } from "@/components/marketing/cards";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import type { Testimonial } from "@/content/testimonials";
import { cn } from "@/lib/utils";

export interface ReviewSummaryProps extends HTMLAttributes<HTMLDivElement> {
  rating: number;
  headline: string;
  countLabel: string;
}

export function ReviewSummary({
  rating,
  headline,
  countLabel,
  className,
  ...props
}: ReviewSummaryProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-5 shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Typography as="p" variant="h2" className="text-primary">
          {rating.toFixed(1)}
        </Typography>
        <div
          className="flex items-center gap-0.5"
          role="img"
          aria-label={`${rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "size-4",
                i < Math.round(rating)
                  ? "fill-warning text-warning"
                  : "fill-muted text-muted",
              )}
              aria-hidden
            />
          ))}
        </div>
      </div>
      <Typography as="p" variant="h5" className="mt-2">
        {headline}
      </Typography>
      <Typography variant="small" className="mt-1">
        {countLabel}
      </Typography>
    </div>
  );
}

export interface FeaturedReviewsProps {
  reviews: Testimonial[];
  className?: string;
}

export function FeaturedReviews({ reviews, className }: FeaturedReviewsProps) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          author={review.author}
          rating={review.rating}
          content={review.content}
          date={review.date}
          source={review.source}
        />
      ))}
    </div>
  );
}

export interface LeaveReviewButtonProps {
  href?: string;
  className?: string;
  children?: ReactNode;
}

export function LeaveReviewButton({
  href,
  className,
  children = "Leave a Google Review",
}: LeaveReviewButtonProps) {
  const destination = href || siteConfig.social.google || routes.marketing.contact;

  return (
    <Button asChild variant="outline" className={className}>
      <Link href={destination} target={destination.startsWith("http") ? "_blank" : undefined}>
        {children}
      </Link>
    </Button>
  );
}
