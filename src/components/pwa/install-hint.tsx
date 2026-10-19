"use client";

import { Share } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  INSTALL_HINT_MIN_MS,
  INSTALL_HINT_SCROLL_PX,
  installHintEngaged,
  installHintShouldShow,
} from "@/lib/install-hint";

const DISMISS_KEY = "fouza-install-hint-dismissed";
const VISIT_KEY = "fouza-install-visits";
const SESSION_KEY = "fouza-install-visit-counted";

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

function readCount(key: string) {
  return Number(window.localStorage.getItem(key) || "0");
}

export function InstallHint() {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let visits = 1;
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
      if (!window.sessionStorage.getItem(SESSION_KEY)) {
        window.sessionStorage.setItem(SESSION_KEY, "1");
        visits = readCount(VISIT_KEY) + 1;
        window.localStorage.setItem(VISIT_KEY, String(visits));
      } else {
        visits = readCount(VISIT_KEY);
      }
    } catch {
      return;
    }

    const started = performance.now();
    let shown = false;

    function showIfReady(activatedControl: boolean) {
      if (shown) return;
      const engaged = installHintEngaged({
        elapsedMs: performance.now() - started,
        scrollY: window.scrollY,
        activatedControl,
      });
      if (
        !installHintShouldShow({
          standalone: isStandalone(),
          iosSafari: isIosSafari(),
          dismissed: false,
          visitCount: visits,
          engaged,
        })
      ) {
        return;
      }
      shown = true;
      setReady(true);
    }

    showIfReady(false);

    function onScroll() {
      if (window.scrollY < INSTALL_HINT_SCROLL_PX) return;
      if (performance.now() - started < INSTALL_HINT_MIN_MS) return;
      showIfReady(false);
    }

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest("a, button");
      if (!control || control.closest("[data-install-hint]")) return;
      showIfReady(true);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
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

  useEffect(() => {
    const root = document.documentElement;
    const hint = hintRef.current;
    if (!ready || menuOpen || !hint) {
      root.style.removeProperty("--install-hint-offset");
      return;
    }

    const apply = () => {
      root.style.setProperty("--install-hint-offset", `${hint.offsetHeight + 8}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(hint);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--install-hint-offset");
    };
  }, [ready, menuOpen]);

  if (!ready || menuOpen) return null;

  return (
    <div
      ref={hintRef}
      data-install-hint
      className="fixed inset-x-3 z-40 flex items-center gap-2 rounded-xl border border-border bg-background/95 px-3 py-2 text-xs leading-snug text-foreground shadow-soft backdrop-blur md:hidden"
      style={{
        bottom: "calc(var(--mobile-action-offset, 0px) + env(safe-area-inset-bottom))",
      }}
      role="dialog"
      aria-label="Add to Home Screen"
    >
      <p className="min-w-0 flex-1">
        <Share className="mb-0.5 mr-1 inline size-3.5" aria-hidden />
        Tap Share, then <strong className="font-semibold">Add to Home Screen</strong>.
      </p>
      <button
        type="button"
        className="inline-flex min-h-11 shrink-0 items-center px-1 font-semibold underline-offset-2 hover:underline"
        onClick={() => {
          try {
            window.localStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* private mode */
          }
          setReady(false);
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
