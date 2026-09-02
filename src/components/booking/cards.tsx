import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  User,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/* ── AppointmentCard ── */

export interface AppointmentCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  date: string;
  time: string;
  practitioner?: string;
  location?: string;
  status?: "confirmed" | "pending" | "cancelled" | "completed";
  actions?: ReactNode;
}

const statusVariant = {
  confirmed: "success",
  pending: "warning",
  cancelled: "destructive",
  completed: "secondary",
} as const;

export function AppointmentCard({
  title,
  date,
  time,
  practitioner,
  location,
  status,
  actions,
  className,
  ...props
}: AppointmentCardProps) {
  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-h5 leading-snug">{title}</CardTitle>
          <CardDescription className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" aria-hidden />
            {date}
          </CardDescription>
        </div>
        {status ? (
          <Badge variant={statusVariant[status]} className="shrink-0 capitalize">
            {status}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="flex items-center gap-2 text-sm text-foreground/90">
          <Clock className="size-4 text-muted-foreground" aria-hidden />
          {time}
        </p>
        {practitioner ? (
          <p className="flex items-center gap-2 text-sm text-foreground/90">
            <User className="size-4 text-muted-foreground" aria-hidden />
            {practitioner}
          </p>
        ) : null}
        {location ? (
          <p className="flex items-center gap-2 text-sm text-foreground/90">
            <MapPin className="size-4 text-muted-foreground" aria-hidden />
            {location}
          </p>
        ) : null}
      </CardContent>
      {actions ? <CardFooter className="pt-0">{actions}</CardFooter> : null}
    </Card>
  );
}

/* ── Availability badges ── */

export function AvailabilityBadge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Badge variant="success" className={cn("normal-case", className)} {...props}>
      Available
    </Badge>
  );
}

export function UnavailableBadge({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Badge variant="secondary" className={cn("normal-case", className)} {...props}>
      Unavailable
    </Badge>
  );
}

/* ── TimeSlotCard ── */

export interface TimeSlotCardProps extends HTMLAttributes<HTMLButtonElement> {
  time: string;
  available?: boolean;
  selected?: boolean;
  label?: string;
  disabled?: boolean;
}

export function TimeSlotCard({
  time,
  available = true,
  selected = false,
  label,
  className,
  disabled,
  ...props
}: TimeSlotCardProps) {
  return (
    <button
      type="button"
      disabled={disabled ?? !available}
      aria-pressed={selected}
      aria-label={label ?? `Book appointment at ${time}`}
      className={cn(
        "touch-target flex min-h-11 flex-col items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-220 ease-premium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : available
            ? "border-border bg-card hover:border-primary/30 hover:bg-secondary"
            : "cursor-not-allowed border-border/60 bg-muted text-muted-foreground opacity-60",
        className,
      )}
      {...props}
    >
      <span>{time}</span>
      {!available ? (
        <span className="text-caption normal-case text-muted-foreground">Unavailable</span>
      ) : null}
    </button>
  );
}

/* ── TreatmentCard ── */

export interface TreatmentCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  duration: string;
  price?: string;
  description?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export function TreatmentCard({
  name,
  duration,
  price,
  description,
  selected = false,
  onSelect,
  className,
  ...props
}: TreatmentCardProps) {
  const interactive = Boolean(onSelect);

  const content = (
    <>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <CardTitle className="min-w-0 flex-1 text-h5 leading-snug [overflow-wrap:anywhere]">
            {name}
          </CardTitle>
          {price ? (
            <Typography as="span" variant="h5" className="shrink-0 whitespace-nowrap text-primary">
              {price}
            </Typography>
          ) : null}
        </div>
        <CardDescription className="flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" aria-hidden />
          {duration}
        </CardDescription>
      </CardHeader>
      {description ? (
        <CardContent className="pt-0">
          <Typography variant="small">{description}</Typography>
        </CardContent>
      ) : null}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        {...(props as HTMLAttributes<HTMLButtonElement>)}
      >
        <Card
          className={cn(
            "h-full shadow-sm transition-all duration-220 ease-premium",
            selected && "border-primary ring-2 ring-primary/20",
          )}
        >
          {content}
        </Card>
      </button>
    );
  }

  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      {content}
    </Card>
  );
}

/* ── PractitionerCard ── */

export interface PractitionerCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  role: string;
  imageSrc?: string;
  imageAlt?: string;
  selected?: boolean;
  onSelect?: () => void;
}

export function PractitionerCard({
  name,
  role,
  imageSrc,
  imageAlt,
  selected = false,
  onSelect,
  className,
  ...props
}: PractitionerCardProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const inner = (
    <Card
      className={cn(
        "shadow-sm transition-all duration-220 ease-premium",
        selected && "border-primary ring-2 ring-primary/20",
        onSelect && "hover:border-primary/30 hover:shadow-soft",
      )}
    >
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <Avatar className="size-14 shrink-0">
          {imageSrc ? <AvatarImage src={imageSrc} alt={imageAlt ?? name} /> : null}
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-h5 leading-snug">{name}</CardTitle>
          <CardDescription className="truncate">{role}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`Select ${name}`}
        className={cn(
          "w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        {...(props as HTMLAttributes<HTMLButtonElement>)}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={className} {...props}>
      {inner}
    </div>
  );
}

/* ── BookingProgressIndicator ── */

export interface BookingStep {
  label: string;
  description?: string;
}

export interface BookingProgressIndicatorProps extends HTMLAttributes<HTMLElement> {
  steps: BookingStep[];
  currentStep: number;
}

export function BookingProgressIndicator({
  steps,
  currentStep,
  className,
  ...props
}: BookingProgressIndicatorProps) {
  const progress = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 100;
  const activeStep = steps[currentStep - 1];

  return (
    <nav aria-label="Booking progress" className={cn("space-y-3", className)} {...props}>
      <Progress value={progress} aria-hidden />
      <ol className="flex items-start justify-between gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;

          return (
            <li
              key={step.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isComplete && "bg-primary text-primary-foreground",
                  isActive && "bg-primary/10 text-primary ring-2 ring-primary",
                  !isComplete && !isActive && "bg-secondary text-muted-foreground",
                )}
              >
                <span className="sr-only">
                  {step.label}
                  {isComplete ? ", completed" : isActive ? ", current step" : ""}
                </span>
                <span aria-hidden>{isComplete ? <CheckCircle2 className="size-4" /> : stepNumber}</span>
              </span>
              <span
                className={cn(
                  "hidden max-w-full truncate px-0.5 text-[11px] font-medium leading-tight md:block",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      {activeStep ? (
        <p className="text-center text-sm font-medium text-foreground md:hidden">
          Step {currentStep} of {steps.length}
          <span className="text-muted-foreground"> · {activeStep.label}</span>
        </p>
      ) : null}
    </nav>
  );
}

/* ── BookingSummaryCard ── */

export interface BookingSummaryItem {
  label: string;
  value: string;
}

export interface BookingSummaryCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: BookingSummaryItem[];
  total?: string;
  footer?: ReactNode;
}

export function BookingSummaryCard({
  title = "Booking summary",
  items,
  total,
  footer,
  className,
  ...props
}: BookingSummaryCardProps) {
  return (
    <Card className={cn("shadow-soft", className)} {...props}>
      <CardHeader className="pb-4">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <dl className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 text-sm">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="text-right font-medium text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
        {total ? (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Typography variant="h5">Total</Typography>
            <Typography variant="h5" className="text-primary">
              {total}
            </Typography>
          </div>
        ) : null}
      </CardContent>
      {footer ? <CardFooter className="flex-col gap-2 pt-0">{footer}</CardFooter> : null}
    </Card>
  );
}

/* ── ConfirmationCard ── */

export interface ConfirmationCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  message: string;
  reference?: string;
  details?: BookingSummaryItem[];
  actions?: ReactNode;
}

export function ConfirmationCard({
  title,
  message,
  reference,
  details = [],
  actions,
  className,
  ...props
}: ConfirmationCardProps) {
  return (
    <Card
      className={cn("border-success/20 shadow-soft", className)}
      role="status"
      aria-live="polite"
      {...props}
    >
      <CardHeader className="items-center pb-4 text-center">
        <div
          className="mb-2 flex size-14 items-center justify-center rounded-full bg-success/12 text-success"
          aria-hidden
        >
          <CheckCircle2 className="size-7" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="max-w-sm">{message}</CardDescription>
        {reference ? (
          <Badge variant="outline" className="mt-2">
            Ref: {reference}
          </Badge>
        ) : null}
      </CardHeader>
      {details.length > 0 ? (
        <CardContent className="pt-0">
          <dl className="space-y-2 rounded-xl bg-secondary/60 p-4">
            {details.map((item) => (
              <div key={item.label} className="flex justify-between gap-4 text-sm">
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd className="font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      ) : null}
      {actions ? (
        <CardFooter className="flex-col gap-2 pt-4">{actions}</CardFooter>
      ) : null}
    </Card>
  );
}
