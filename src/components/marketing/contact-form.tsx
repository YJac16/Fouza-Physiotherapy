"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("loading");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
      website: String(formData.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setStatus("error");
        setError("Unable to send right now. Please WhatsApp or call us.");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError("Unable to send right now. Please WhatsApp or call us.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="hidden" aria-hidden>
        <Label htmlFor="contact-website">Website</Label>
        <Input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Full name</Label>
          <Input id="contact-name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone</Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">How can we help?</Label>
        <Textarea id="contact-message" name="message" required rows={5} />
      </div>
      {status === "success" ? (
        <FormMessage tone="success">
          Thank you — your message has been received. We&apos;ll respond shortly.
        </FormMessage>
      ) : null}
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
      <Button type="submit" className="w-full sm:w-auto" loading={status === "loading"}>
        Send message
      </Button>
    </form>
  );
}
