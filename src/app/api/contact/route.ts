import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

import { siteConfig } from "@/config/site";
import { isHoneypotFilled, rateLimit } from "@/lib/security";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  message: z.string().min(10),
  website: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const limited = rateLimit(`contact:${ip}`, 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (isHoneypotFilled(parsed.data.website)) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_xxx")) {
    return NextResponse.json(
      {
        ok: true,
        queued: false,
        message: "Message received (email provider not configured in this environment).",
      },
      { status: 202 },
    );
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? siteConfig.email,
    to: siteConfig.email,
    replyTo: parsed.data.email,
    subject: `Website enquiry from ${parsed.data.name}`,
    text: `Name: ${parsed.data.name}\nPhone: ${parsed.data.phone}\nEmail: ${parsed.data.email}\n\n${parsed.data.message}`,
  });

  return NextResponse.json({ ok: true });
}
