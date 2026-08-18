"use client";

import { Share, Smartphone, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "fouza-install-prompt-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  const displayStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return displayStandalone || iosStandalone;
}

function isIosSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return iOS && webkit && !otherBrowser && !isStandaloneDisplay();
}

export function InstallAppPrompt({ className }: { className?: string }) {
  const [visible, setVisible] = React.useState(false);
  const [ios, setIos] = React.useState(false);
  const deferredPrompt = React.useRef<BeforeInstallPromptEvent | null>(null);

  const dismiss = React.useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore quota / private-mode failures.
    }
    setVisible(false);
  }, []);

  React.useEffect(() => {
    if (isStandaloneDisplay()) return;

    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // Continue if storage is unavailable.
    }

    if (isIosSafari()) {
      setIos(true);
      setVisible(true);
      return;
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      setIos(false);
      setVisible(true);
    }

    function onAppInstalled() {
      deferredPrompt.current = null;
      setVisible(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function install() {
    const promptEvent = deferredPrompt.current;
    if (!promptEvent) return;
    await promptEvent.prompt();
    try {
      await promptEvent.userChoice;
    } finally {
      deferredPrompt.current = null;
      dismiss();
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Add to Home Screen"
      className={cn(
        "fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-border/80 bg-card p-4 shadow-soft-lg sm:left-auto sm:right-5 sm:w-80",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {ios ? <Share className="size-4" aria-hidden /> : <Smartphone className="size-4" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-display text-sm font-semibold text-foreground">Add to Home Screen</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {ios
              ? `Open Share, then tap Add to Home Screen to use ${siteConfig.name} like an app.`
              : `Install ${siteConfig.name} like an app for quicker booking and portal access.`}
          </p>
          {ios ? null : (
            <Button type="button" size="sm" className="w-full" onClick={() => void install()}>
              Add to Home Screen
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss add to Home Screen tip"
          onClick={dismiss}
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
