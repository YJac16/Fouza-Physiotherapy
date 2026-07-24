"use client";

import { MessageCircle } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function WhatsAppFloat({ className }: { className?: string }) {
  return (
    <a
      href={siteConfig.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft-lg transition-transform duration-220 ease-premium hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
