import { NextResponse } from "next/server";

import { purgeExpiredHolds } from "@/features/booking/api/bookings";
import { drainEmailOutbox } from "@/features/notifications";
import { authorizeCronRequest } from "@/lib/cron/auth";

async function handle(request: Request) {
  if (!authorizeCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [holds, outbox] = await Promise.all([
    purgeExpiredHolds(),
    drainEmailOutbox(25),
  ]);
  return NextResponse.json({ holds, outbox });
}

/** Vercel Cron invokes GET with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
