"use client";

import { Share, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "fouza-install-hint-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return true;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return media || iosStandalone;
}

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function isAndroidDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

function dismissHint() {
  window.localStorage.setItem(STORAGE_KEY, "1");
}

export function InstallHint() {
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") return;

    const iosDevice = isIosDevice();
    const androidDevice = isAndroidDevice();
    setIos(iosDevice);

    function onBeforeInstall(event: Event) {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      setCanPrompt(true);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const timer = window.setTimeout(() => {
      if (iosDevice || androidDevice || deferredPrompt.current) setVisible(true);
    }, 1800);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.clearTimeout(timer);
    };
  }, []);

  async function install() {
    const promptEvent = deferredPrompt.current;
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    deferredPrompt.current = null;
    setCanPrompt(false);
    dismissHint();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="border-b border-border bg-secondary/70 px-4 py-2 text-center text-xs text-muted-foreground sm:text-sm">
      <p className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <Smartphone className="size-3.5 shrink-0 text-primary" aria-hidden />
        {ios ? (
          <span>
            Add Fouza Physiotherapy to your home screen: tap{" "}
            <Share className="mb-0.5 inline size-3.5" aria-hidden /> Share, then{" "}
            <strong className="font-medium text-foreground">Add to Home Screen</strong>.
          </span>
        ) : canPrompt ? (
          <span>Install Fouza Physiotherapy on this device for quicker booking.</span>
        ) : (
          <span>
            Add Fouza Physiotherapy from the browser menu (Install app or Add to Home screen).
          </span>
        )}
        {canPrompt ? (
          <button
            type="button"
            className="font-medium text-foreground underline-offset-2 hover:underline"
            onClick={() => void install()}
          >
            Install
          </button>
        ) : null}
        <button
          type="button"
          className="font-medium text-foreground underline-offset-2 hover:underline"
          onClick={() => {
            dismissHint();
            setVisible(false);
          }}
        >
          Dismiss
        </button>
      </p>
    </div>
  );
}
