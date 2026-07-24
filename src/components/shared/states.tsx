import { AlertTriangle, FileQuestion, Inbox, Wrench } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center",
        className,
      )}
    >
      <div
        className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-card text-muted-foreground shadow-sm"
        aria-hidden
      >
        {icon ?? <Inbox className="size-5" />}
      </div>
      <Typography as="h3" variant="h5">
        {title}
      </Typography>
      {description ? (
        <Typography variant="small" className="mt-2 max-w-sm">
          {description}
        </Typography>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function LoadingSkeleton({ rows = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} aria-busy aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn’t complete that request. Please try again.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-14 text-center",
        className,
      )}
      role="alert"
    >
      <div
        className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-card text-destructive shadow-sm"
        aria-hidden
      >
        <AlertTriangle className="size-5" />
      </div>
      <Typography as="h3" variant="h5">
        {title}
      </Typography>
      <Typography variant="small" className="mt-2 max-w-sm">
        {description}
      </Typography>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export interface NotFoundPageProps {
  className?: string;
}

export function NotFoundPage({ className }: NotFoundPageProps) {
  return (
    <div
      className={cn(
        "flex min-h-[70vh] flex-col items-center justify-center px-6 text-center",
        className,
      )}
    >
      <FileQuestion className="mb-4 size-10 text-muted-foreground" aria-hidden />
      <Typography as="h1" variant="h1">
        Page not found
      </Typography>
      <Typography variant="body-lg" className="mt-3 max-w-md">
        The page you’re looking for doesn’t exist or may have moved.
      </Typography>
      <Button asChild className="mt-8">
        <Link href={routes.marketing.home}>Back to home</Link>
      </Button>
    </div>
  );
}

export interface MaintenancePageProps {
  className?: string;
  eta?: string;
}

export function MaintenancePage({ className, eta }: MaintenancePageProps) {
  return (
    <div
      className={cn(
        "flex min-h-[70vh] flex-col items-center justify-center px-6 text-center",
        className,
      )}
    >
      <Wrench className="mb-4 size-10 text-primary" aria-hidden />
      <Typography as="h1" variant="h1">
        We’ll be right back
      </Typography>
      <Typography variant="body-lg" className="mt-3 max-w-md">
        Fouza Physiotherapy is undergoing scheduled maintenance to improve your care
        experience.
      </Typography>
      {eta ? (
        <Typography variant="small" className="mt-4">
          Expected return: {eta}
        </Typography>
      ) : null}
    </div>
  );
}
