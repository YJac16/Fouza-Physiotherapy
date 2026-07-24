import { NextResponse } from "next/server";

import { drainEmailOutbox } from "@/features/notifications";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await drainEmailOutbox(25);
  return NextResponse.json(result);
}
