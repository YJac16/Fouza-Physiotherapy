"use client";

import { Share } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "fouza-install-hint-dismissed";
const VISIT_KEY = "fouza-install-visits";

function isStandalone() {
  if (typeof window === "undefined") return true;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return media || iosStandalone;
}

/** iPhone, iPad, and iPadOS desktop-mode Safari. Other iOS browsers are excluded. */
function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Android/i.test(ua);
  return iOS && /Safari/i.test(ua) && !otherBrowser;
}

function dismissHint() {
  window.localStorage.setItem(DISMISS_KEY, "1");
}

export function InstallHint() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    if (!isIosSafari()) return;

    const visits = Number(window.localStorage.getItem(VISIT_KEY) || "0") + 1;
    window.localStorage.setItem(VISIT_KEY, String(visits));

    let shown = false;
    function show() {
      if (shown) return;
      shown = true;
      setReady(true);
    }

    if (visits >= 2) {
      show();
      return;
    }

    function onEngage() {
      show();
    }

    window.addEventListener("scroll", onEngage, { once: true, passive: true });
    window.addEventListener("pointerdown", onEngage, { once: true });

    return () => {
      window.removeEventListener("scroll", onEngage);
      window.removeEventListener("pointerdown", onEngage);
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      setMenuOpen(document.documentElement.dataset.mobileNav === "open");
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mobile-nav"],
    });
    return () => observer.disconnect();
  }, []);

  if (!ready || menuOpen) return null;

  return (
    <div
      className="fixed inset-x-3 z-50 rounded-2xl border border-border bg-background/95 p-4 text-sm text-foreground shadow-soft-lg backdrop-blur md:hidden"
      style={{
        bottom: "calc(var(--mobile-action-offset, 0px) + env(safe-area-inset-bottom) + 0.75rem)",
      }}
      role="dialog"
      aria-label="Add to Home Screen"
    >
      <p className="leading-relaxed">
        Add Fouza Physiotherapy to your home screen: tap{" "}
        <Share className="mb-0.5 inline size-4" aria-hidden /> Share, then{" "}
        <strong className="font-semibold">Add to Home Screen</strong>.
      </p>
      <button
        type="button"
        className="mt-3 inline-flex min-h-11 items-center font-semibold underline-offset-2 hover:underline"
        onClick={() => {
          dismissHint();
          setReady(false);
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
