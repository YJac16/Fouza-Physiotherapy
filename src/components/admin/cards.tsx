import {
  Activity,
  Bell,
  Calendar,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/* ── DashboardStatCard ── */

export interface DashboardStatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
}

export function DashboardStatCard({
  label,
  value,
  change,
  trend = "neutral",
  icon,
  className,
  ...props
}: DashboardStatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;

  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        {icon ? (
          <div
            className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden
          >
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        <Typography variant="h3" className="text-foreground">
          {value}
        </Typography>
        {change ? (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              trend === "neutral" && "text-muted-foreground",
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden />
            {change}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/* ── RevenueCard ── */

export interface RevenueCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  amount: string;
  period?: string;
  change?: string;
  trend?: "up" | "down";
  chart?: ReactNode;
}

export function RevenueCard({
  title = "Cash collected",
  amount,
  period,
  change,
  trend,
  chart,
  className,
  ...props
}: RevenueCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-h5">{title}</CardTitle>
          <DollarSign className="size-5 text-muted-foreground" aria-hidden />
        </div>
        {period ? <CardDescription>{period}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div>
          <Typography variant="h2" className="text-primary">
            {amount}
          </Typography>
          {change && trend ? (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-sm font-medium",
                trend === "up" ? "text-success" : "text-destructive",
              )}
            >
              <TrendIcon className="size-4" aria-hidden />
              {change}
            </p>
          ) : null}
        </div>
        {chart ?? <ChartsPlaceholder height="h-32" />}
      </CardContent>
    </Card>
  );
}

/* ── AdminAppointmentCard ── */

export interface AdminAppointmentCardProps extends HTMLAttributes<HTMLDivElement> {
  patientName: string;
  treatment: string;
  time: string;
  status?: "scheduled" | "in-progress" | "completed" | "no-show" | "cancelled";
  avatarSrc?: string;
  actions?: ReactNode;
}

const adminApptStatus = {
  scheduled: "info",
  "in-progress": "warning",
  completed: "success",
  "no-show": "destructive",
  cancelled: "secondary",
} as const;

export function AdminAppointmentCard({
  patientName,
  treatment,
  time,
  status = "scheduled",
  avatarSrc,
  actions,
  className,
  ...props
}: AdminAppointmentCardProps) {
  const initials = patientName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className={cn("min-w-0 overflow-hidden shadow-sm", className)} {...props}>
      <CardHeader className="flex flex-col items-stretch gap-3 space-y-0 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar className="size-10 shrink-0">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt={patientName} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <CardTitle className="min-w-0 text-base leading-snug [overflow-wrap:anywhere]">
                {patientName}
              </CardTitle>
              <Badge
                variant={adminApptStatus[status]}
                className="w-fit shrink-0 capitalize"
              >
                {status.replace("-", " ")}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2 [overflow-wrap:anywhere]">
              {treatment}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="flex min-w-0 items-start gap-1.5 text-sm text-muted-foreground">
          <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span className="[overflow-wrap:anywhere]">{time}</span>
        </p>
        {actions ? <div className="min-w-0 w-full">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}

/* ── ActivityFeed ── */

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  type?: "info" | "success" | "warning";
}

export interface ActivityFeedProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: ActivityItem[];
  emptyMessage?: string;
}

export function ActivityFeed({
  title = "Recent activity",
  items,
  emptyMessage = "No recent activity",
  className,
  ...props
}: ActivityFeedProps) {
  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="pb-3">
        <CardTitle className="text-h5">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-4" aria-label={title}>
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0 rounded-full",
                    item.type === "success" && "bg-success",
                    item.type === "warning" && "bg-warning",
                    (!item.type || item.type === "info") && "bg-info",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{item.message}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

/* ── NotificationsPanel ── */

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

export interface NotificationsPanelProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  notifications: NotificationItem[];
  footer?: ReactNode;
}

export function NotificationsPanel({
  title = "Notifications",
  notifications,
  footer,
  className,
  ...props
}: NotificationsPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-h5">{title}</CardTitle>
        {unreadCount > 0 ? (
          <Badge variant="default" aria-label={`${unreadCount} unread`}>
            {unreadCount}
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Bell className="size-8 text-muted-foreground/50" aria-hidden />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-border" aria-label={title}>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={cn(
                  "py-3 first:pt-0 last:pb-0",
                  !notification.read && "bg-primary/5 -mx-2 rounded-lg px-2",
                )}
              >
                <p className="text-sm font-medium text-foreground">{notification.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
    </Card>
  );
}

/* ── ChartsPlaceholder ── */

export interface ChartsPlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  height?: string;
}

export function ChartsPlaceholder({
  title,
  height = "h-48",
  className,
  ...props
}: ChartsPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40",
        height,
        className,
      )}
      role="img"
      aria-label={title ?? "Chart placeholder"}
      {...props}
    >
      <Activity className="mb-2 size-6 text-muted-foreground/50" aria-hidden />
      <p className="text-xs text-muted-foreground">{title ?? "Chart area"}</p>
    </div>
  );
}

/* ── PatientTable ── */

export interface PatientTableColumn {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
}

export interface PatientTableRow {
  id: string;
  [key: string]: ReactNode;
}

export interface PatientTableProps extends HTMLAttributes<HTMLDivElement> {
  columns: PatientTableColumn[];
  rows: PatientTableRow[];
  caption?: string;
  emptyMessage?: string;
}

export function PatientTable({
  columns,
  rows,
  caption = "Patients",
  emptyMessage = "No patients found",
  className,
  ...props
}: PatientTableProps) {
  const nameCol = columns.find((col) => col.key === "name") ?? columns[0];
  const actionCol =
    columns.find((col) => col.key === "view") ?? columns.find((col) => col.align === "right");

  return (
    <Card className={cn("overflow-hidden shadow-sm", className)} {...props}>
      <ul className="divide-y divide-border lg:hidden" aria-label={caption}>
        {rows.length === 0 ? (
          <li className="px-4 py-12 text-center text-sm text-muted-foreground">{emptyMessage}</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1 truncate font-medium">{row[nameCol.key]}</div>
              {actionCol ? <div className="shrink-0">{row[actionCol.key]}</div> : null}
            </li>
          ))
        )}
      </ul>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left font-medium text-muted-foreground",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/60 transition-colors hover:bg-secondary/30"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-foreground",
                        col.key === "name" && "max-w-[14rem] truncate",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right",
                      )}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ── AdminCalendarView ── */

export interface AdminCalendarViewProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  monthLabel?: string;
  days?: number;
  header?: ReactNode;
}

export function AdminCalendarView({
  title = "Calendar",
  monthLabel,
  days = 35,
  header,
  className,
  ...props
}: AdminCalendarViewProps) {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <Card className={cn("shadow-sm", className)} {...props}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-primary" aria-hidden />
          <CardTitle className="text-h5">{title}</CardTitle>
        </div>
        {header ?? (
          monthLabel ? (
            <Typography variant="small" className="font-medium text-foreground">
              {monthLabel}
            </Typography>
          ) : null
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label={title}>
          {dayLabels.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
              role="columnheader"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: days }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg border border-border/60 bg-secondary/30 p-1"
              role="gridcell"
            >
              <Skeleton className="size-full rounded-md opacity-40" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* Default stat icon helper */
export function StatIconPatients() {
  return <Users className="size-4" />;
}

export function StatIconRevenue() {
  return <DollarSign className="size-4" />;
}
