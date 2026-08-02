"use client";

import {
  Activity,
  BookOpen,
  Calendar,
  CalendarClock,
  ClipboardList,
  Dumbbell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import { signOutAction } from "@/features/auth";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types/auth";

const adminNav = [
  { label: "Dashboard", href: routes.admin.dashboard, icon: LayoutDashboard },
  { label: "Appointments", href: routes.admin.appointments, icon: Calendar },
  { label: "Patients", href: routes.admin.patients, icon: Users },
  { label: "Clinical notes", href: routes.admin.clinicalNotes, icon: ClipboardList },
  { label: "Programmes", href: routes.admin.programmes, icon: Dumbbell },
  { label: "Billing", href: routes.admin.billing, icon: FileText },
  { label: "Documents", href: routes.admin.documents, icon: FileText },
  { label: "Informed consent", href: routes.admin.consentForms, icon: ClipboardList },
  { label: "Availability", href: routes.admin.availability, icon: CalendarClock },
  { label: "Users", href: routes.admin.users, icon: Users, adminOnly: true },
  { label: "Reviews", href: routes.admin.reviews, icon: Star },
  { label: "Blog", href: routes.admin.blog, icon: BookOpen },
  { label: "Analytics", href: routes.admin.analytics, icon: Activity },
  { label: "Settings", href: routes.admin.settings, icon: Settings },
] as const;

function titleFromPath(pathname: string) {
  const match = adminNav.find(
    (item) =>
      pathname === item.href ||
      (item.href !== routes.admin.dashboard && pathname.startsWith(item.href)),
  );
  return match?.label ?? "Dashboard";
}

export interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
  role?: AppRole;
}

export function AdminSidebar({ className, onNavigate, role }: AdminSidebarProps) {
  const pathname = usePathname();
  const items = adminNav.filter((item) => !("adminOnly" in item && item.adminOnly) || role === "admin");

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border/70 bg-card",
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo size="sm" href={routes.admin.root} />
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== routes.admin.dashboard && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export interface AdminHeaderProps {
  title?: string;
  userName?: string;
  className?: string;
  onMenuClick?: () => void;
}

export function AdminHeader({
  title = "Dashboard",
  userName = "Staff",
  className,
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between gap-4 border-b border-border/70 bg-card/80 px-4 backdrop-blur-xl md:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0 md:hidden"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Menu />
          </Button>
        ) : null}
        <h1 className="truncate font-display text-h5 tracking-tight">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <div className="flex max-w-[40vw] items-center gap-2 rounded-xl border border-border/70 px-2 py-1.5 sm:max-w-none">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {userName
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden truncate text-sm font-medium sm:inline">{userName}</span>
        </div>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut />
          </Button>
        </form>
      </div>
    </header>
  );
}

export interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  userName?: string;
  role?: AppRole;
}

export function AdminShell({ children, title, userName, role }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const resolvedTitle = title ?? titleFromPath(pathname);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <AdminSidebar role={role} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex h-full w-72 flex-col bg-card shadow-soft-lg animate-slide-in-right">
            <div className="absolute right-3 top-3 z-10">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
              >
                <X />
              </Button>
            </div>
            <AdminSidebar role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={resolvedTitle}
          userName={userName}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
