"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Bell,
  Calendar,
  Dumbbell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  User,
  X,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import { signOutAction } from "@/features/auth";
import { cn } from "@/lib/utils";

const portalNav = [
  { label: "Dashboard", href: routes.portal.root, icon: LayoutDashboard },
  { label: "Appointments", href: routes.portal.appointments, icon: Calendar },
  { label: "Programmes", href: routes.portal.programmes, icon: Dumbbell },
  { label: "Invoices", href: routes.portal.invoices, icon: Receipt },
  { label: "Informed consent", href: routes.portal.forms, icon: FileText },
  { label: "Documents", href: routes.portal.documents, icon: FileText },
  { label: "Profile", href: routes.portal.profile, icon: User },
  { label: "Notifications", href: routes.portal.notifications, icon: Bell },
];

export interface PortalSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function PortalSidebar({ className, onNavigate }: PortalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-border/70 bg-card",
        className,
      )}
    >
      <div className="flex h-16 items-center px-5">
        <Logo size="sm" href={routes.portal.root} />
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3" aria-label="Patient portal">
        {portalNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== routes.portal.root && pathname.startsWith(item.href));
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

export interface PortalHeaderProps {
  title?: string;
  userName?: string;
  className?: string;
  onMenuClick?: () => void;
}

export function PortalHeader({
  title = "Dashboard",
  userName = "Patient",
  className,
  onMenuClick,
}: PortalHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between gap-4 border-b border-border/70 bg-card/80 px-4 backdrop-blur-xl md:px-6",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {onMenuClick ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <Menu />
          </Button>
        ) : null}
        <h1 className="font-display text-h5 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2 rounded-xl border border-border/70 px-2 py-1.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {userName
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">{userName}</span>
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

export interface PortalShellProps {
  children: React.ReactNode;
  title?: string;
  userName?: string;
}

export function PortalShell({ children, title, userName }: PortalShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <PortalSidebar />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-72 bg-card shadow-soft-lg animate-slide-in-right">
            <div className="absolute right-3 top-3">
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
            <PortalSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <PortalHeader
          title={title}
          userName={userName}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
