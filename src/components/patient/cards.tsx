import { Calendar, FileText, Heart, Receipt, Shield } from "lucide-react";
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

/* ── PatientProfileCard ── */

export interface PatientProfileCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  email?: string;
  phone?: string;
  memberSince?: string;
  imageSrc?: string;
  actions?: ReactNode;
}

export function PatientProfileCard({
  name,
  email,
  phone,
  memberSince,
  imageSrc,
  actions,
  className,
  ...props
}: PatientProfileCardProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <Avatar className="size-16 shrink-0">
          {imageSrc ? <AvatarImage src={imageSrc} alt={name} /> : null}
          <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate leading-snug">{name}</CardTitle>
          {memberSince ? (
            <CardDescription className="truncate">Member since {memberSince}</CardDescription>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {email ? (
          <p className="break-all text-sm text-foreground/90 sm:truncate">{email}</p>
        ) : null}
        {phone ? <p className="text-sm text-foreground/90">{phone}</p> : null}
      </CardContent>
      {actions ? <CardFooter className="pt-0">{actions}</CardFooter> : null}
    </Card>
  );
}

/* ── MedicalAidCard ── */

export interface MedicalAidCardProps extends HTMLAttributes<HTMLDivElement> {
  provider: string;
  plan?: string;
  memberNumber?: string;
  status?: "active" | "pending" | "expired";
  actions?: ReactNode;
}

const medicalAidStatus = {
  active: "success",
  pending: "warning",
  expired: "destructive",
} as const;

export function MedicalAidCard({
  provider,
  plan,
  memberNumber,
  status = "active",
  actions,
  className,
  ...props
}: MedicalAidCardProps) {
  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground"
            aria-hidden
          >
            <Shield className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-h5 leading-snug">{provider}</CardTitle>
            {plan ? <CardDescription className="truncate">{plan}</CardDescription> : null}
          </div>
        </div>
        <Badge variant={medicalAidStatus[status]} className="shrink-0 capitalize">
          {status}
        </Badge>
      </CardHeader>
      {memberNumber ? (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            Member no.{" "}
            <span className="font-medium text-foreground">{memberNumber}</span>
          </p>
        </CardContent>
      ) : null}
      {actions ? <CardFooter className="pt-0">{actions}</CardFooter> : null}
    </Card>
  );
}

/* ── ExerciseCard ── */

export interface ExerciseCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  sets?: string;
  reps?: string;
  duration?: string;
  instructions?: string | null;
  mediaUrl?: string | null;
  progress?: number;
  completed?: boolean;
  actions?: ReactNode;
}

export function ExerciseCard({
  name,
  sets,
  reps,
  duration,
  instructions,
  mediaUrl,
  progress,
  completed = false,
  actions,
  className,
  ...props
}: ExerciseCardProps) {
  const details = [sets && `${sets} sets`, reps && `${reps} reps`, duration]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card
      className={cn(
        "shadow-sm transition-colors",
        completed && "border-success/20 bg-success/5",
        className,
      )}
      {...props}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="min-w-0 flex-1 text-h5 leading-snug">{name}</CardTitle>
          {completed ? (
            <Badge variant="success" className="shrink-0">
              Done
            </Badge>
          ) : progress !== undefined ? (
            <Badge variant="info" className="shrink-0">
              {progress}%
            </Badge>
          ) : null}
        </div>
        {details ? <CardDescription>{details}</CardDescription> : null}
      </CardHeader>
      {mediaUrl ? (
        <CardContent className="pt-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URLs */}
          <img
            src={mediaUrl}
            alt={`${name} diagram`}
            className="aspect-video w-full rounded-xl bg-muted object-contain"
          />
        </CardContent>
      ) : null}
      {instructions ? (
        <CardContent className={cn("pt-0", mediaUrl && "pt-3")}>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{instructions}</p>
        </CardContent>
      ) : null}
      {progress !== undefined && !completed ? (
        <CardContent className={cn("pt-0", (mediaUrl || instructions) && "pt-3")}>
          <Progress value={progress} aria-label={`${name} progress`} />
        </CardContent>
      ) : null}
      {actions ? <CardFooter className="pt-0">{actions}</CardFooter> : null}
    </Card>
  );
}

/* ── DocumentCard ── */

export interface DocumentCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  type?: string;
  date?: string;
  size?: string;
  actions?: ReactNode;
}

export function DocumentCard({
  title,
  type,
  date,
  size,
  actions,
  className,
  ...props
}: DocumentCardProps) {
  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-start gap-3 space-y-0 pb-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground"
          aria-hidden
        >
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-h5">{title}</CardTitle>
          <CardDescription>
            {[type, date, size].filter(Boolean).join(" · ")}
          </CardDescription>
        </div>
      </CardHeader>
      {actions ? <CardFooter className="pt-0">{actions}</CardFooter> : null}
    </Card>
  );
}

/* ── InvoiceCard ── */

export interface InvoiceCardProps extends HTMLAttributes<HTMLDivElement> {
  invoiceNumber: string;
  date: string;
  amount: string;
  status?: "paid" | "pending" | "overdue";
  actions?: ReactNode;
}

const invoiceStatus = {
  paid: "success",
  pending: "warning",
  overdue: "destructive",
} as const;

export function InvoiceCard({
  invoiceNumber,
  date,
  amount,
  status = "pending",
  actions,
  className,
  ...props
}: InvoiceCardProps) {
  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden
          >
            <Receipt className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-h5 leading-snug">{invoiceNumber}</CardTitle>
            <CardDescription className="truncate">{date}</CardDescription>
          </div>
        </div>
        <Badge variant={invoiceStatus[status]} className="shrink-0 capitalize">
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <Typography variant="h4" className="text-primary">
          {amount}
        </Typography>
      </CardContent>
      {actions ? <CardFooter className="pt-0">{actions}</CardFooter> : null}
    </Card>
  );
}

/* ── StatementCard ── */

export interface StatementCardProps extends HTMLAttributes<HTMLDivElement> {
  period: string;
  openingBalance: string;
  closingBalance: string;
  transactions?: number;
  actions?: ReactNode;
}

export function StatementCard({
  period,
  openingBalance,
  closingBalance,
  transactions,
  actions,
  className,
  ...props
}: StatementCardProps) {
  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="pb-3">
        <CardTitle className="text-h5">{period}</CardTitle>
        {transactions !== undefined ? (
          <CardDescription>{transactions} transactions</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Opening</span>
          <span className="font-medium">{openingBalance}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Closing</span>
          <span className="font-semibold text-primary">{closingBalance}</span>
        </div>
      </CardContent>
      {actions ? <CardFooter className="pt-0">{actions}</CardFooter> : null}
    </Card>
  );
}

/* ── AppointmentHistoryCard ── */

export interface AppointmentHistoryCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  date: string;
  practitioner: string;
  outcome?: string;
  actions?: ReactNode;
}

export function AppointmentHistoryCard({
  title,
  date,
  practitioner,
  outcome,
  actions,
  className,
  ...props
}: AppointmentHistoryCardProps) {
  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-h5">{title}</CardTitle>
          <Badge variant="secondary">
            <Calendar className="mr-1 size-3" aria-hidden />
            {date}
          </Badge>
        </div>
        <CardDescription>{practitioner}</CardDescription>
      </CardHeader>
      {outcome ? (
        <CardContent className="pt-0">
          <Typography variant="small">{outcome}</Typography>
        </CardContent>
      ) : null}
      {actions ? <CardFooter className="pt-0">{actions}</CardFooter> : null}
    </Card>
  );
}

/* ── ConsentStatusCard ── */

export interface ConsentStatusCardProps extends HTMLAttributes<HTMLDivElement> {
  formName: string;
  status: "signed" | "pending" | "expired";
  signedDate?: string;
  expiresDate?: string;
  actions?: ReactNode;
}

const consentStatus = {
  signed: "success",
  pending: "warning",
  expired: "destructive",
} as const;

export function ConsentStatusCard({
  formName,
  status,
  signedDate,
  expiresDate,
  actions,
  className,
  ...props
}: ConsentStatusCardProps) {
  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground"
            aria-hidden
          >
            <Heart className="size-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate text-h5 leading-snug">{formName}</CardTitle>
            {signedDate ? (
              <CardDescription className="truncate">Signed {signedDate}</CardDescription>
            ) : expiresDate ? (
              <CardDescription className="truncate">Expires {expiresDate}</CardDescription>
            ) : null}
          </div>
        </div>
        <Badge variant={consentStatus[status]} className="shrink-0 capitalize">
          {status}
        </Badge>
      </CardHeader>
      {actions ? <CardFooter className="pt-0">{actions}</CardFooter> : null}
    </Card>
  );
}
