import { NextResponse } from "next/server";

import { purgeExpiredHolds } from "@/features/booking/api/bookings";
import { enqueueAppointmentReminders } from "@/features/notifications/lib/appointment-reminders";
import { authorizeCronRequest } from "@/lib/cron/auth";

async function handle(request: Request) {
  if (!authorizeCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [holds, reminders] = await Promise.all([
    purgeExpiredHolds(),
    enqueueAppointmentReminders(),
  ]);
  return NextResponse.json({ holds, reminders });
}

/** Vercel Cron invokes GET with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
