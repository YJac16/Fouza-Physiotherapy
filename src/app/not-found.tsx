import Link from "next/link";

import { SiteShell } from "@/components/layout/site-shell";
import { routes } from "@/config/routes";

export default function GlobalNotFound() {
  return (
    <SiteShell auth={null} showNewsletter={false}>
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="max-w-md text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
          <Link href={routes.marketing.home} className="text-primary underline-offset-4 hover:underline">
            Back to home
          </Link>
          <Link href={routes.booking.root} className="text-primary underline-offset-4 hover:underline">
            Book an appointment
          </Link>
          <Link href={routes.marketing.contact} className="text-primary underline-offset-4 hover:underline">
            Contact us
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
