import { NextResponse } from "next/server";

import { enqueueAppointmentReminders } from "@/features/notifications/lib/appointment-reminders";

function authorize(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function handle(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await enqueueAppointmentReminders();
  return NextResponse.json(result);
}

/** Vercel Cron invokes GET with `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
