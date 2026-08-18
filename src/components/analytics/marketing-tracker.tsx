"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics/gtag";

function locationFrom(el: HTMLElement) {
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest("[data-hero]")) return "hero";
  return "page";
}

function closestAnchor(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest("a");
}

export function MarketingTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const anchor = closestAnchor(event.target);
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      const location = locationFrom(anchor);

      if (href.startsWith("tel:")) {
        trackEvent("phone_click", { location });
        return;
      }
      if (href.startsWith("mailto:")) {
        trackEvent("email_click", { location });
        return;
      }
      if (href.includes("wa.me") || href.includes("whatsapp")) {
        trackEvent("whatsapp_click", { location });
        trackEvent("generate_lead", { method: "whatsapp", location });
        return;
      }
      if (href.includes("google.com/maps") || href.includes("maps.google") || href.includes("place_id")) {
        trackEvent("map_click", { location });
        return;
      }
      if (href === "/book" || href.startsWith("/book?")) {
        const itemId = anchor.getAttribute("data-item-id");
        if (itemId) {
          trackEvent("select_item", {
            item_id: itemId,
            ...(anchor.getAttribute("data-item-name")
              ? { item_name: anchor.getAttribute("data-item-name") ?? undefined }
              : {}),
          });
        }
        trackEvent("book_click", { location });
        trackEvent("generate_lead", { method: "book", location });
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}

export function TrackViewItem({
  itemId,
  itemName,
}: {
  itemId: string;
  itemName?: string;
}) {
  useEffect(() => {
    trackEvent("view_item", {
      item_id: itemId,
      ...(itemName ? { item_name: itemName } : {}),
    });
  }, [itemId, itemName]);
  return null;
}

export function TrackBookingStarted() {
  useEffect(() => {
    trackEvent("booking_started");
  }, []);
  return null;
}

export function TrackBookingCompleted({ transactionId }: { transactionId?: string }) {
  useEffect(() => {
    trackEvent("booking_completed", {
      currency: "ZAR",
      ...(transactionId ? { transaction_id: transactionId } : {}),
    });
  }, [transactionId]);
  return null;
}
