"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/** Clinical motion: longer dwell, modest centre scale, gentle slide. */
export const COVERFLOW_DWELL_MS = 5600;
export const COVERFLOW_SLIDE_MS = 780;
export const COVERFLOW_ACTIVE_SCALE = 1.18;
export const COVERFLOW_SIDE_SCALE = 0.9;

export type CoverflowAutoplayGate = {
  reduceMotion: boolean;
  paused: boolean;
  inView: boolean;
  pageVisible: boolean;
  count: number;
  dragging: boolean;
};

/** Shared gate so autoplay only runs when the strip is on-screen and idle. */
export function shouldRunCoverflowAutoplay(state: CoverflowAutoplayGate) {
  return (
    !state.reduceMotion &&
    !state.paused &&
    state.inView &&
    state.pageVisible &&
    state.count >= 2 &&
    !state.dragging
  );
}

type SnapCoverflowProps = {
  children: ReactNode;
  dwellMs?: number;
  slideMs?: number;
  activeScale?: number;
  sideScale?: number;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
};

/**
 * Snap-to-centre coverflow adapted from Move in Africa’s catalogue motion,
 * restyled with Fouza defaults (teal focus, modest scale, 5–6s dwell).
 *
 * Autoplay starts when the strip enters the viewport. Hover-pause is limited
 * to fine pointers (mouse); tap-focus and iOS sticky hover must not freeze it.
 * `prefers-reduced-motion: reduce` disables autoplay (parent shows a grid).
 */
export function SnapCoverflow({
  children,
  dwellMs = COVERFLOW_DWELL_MS,
  slideMs = COVERFLOW_SLIDE_MS,
  activeScale = COVERFLOW_ACTIVE_SCALE,
  sideScale = COVERFLOW_SIDE_SCALE,
  className,
  trackClassName,
  ariaLabel = "Services catalogue",
}: SnapCoverflowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);
  const inViewRef = useRef(false);
  const pageVisibleRef = useRef(true);
  const hoverCapableRef = useRef(false);
  const keyboardFocusRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const indexRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const stepRef = useRef(280);
  const suppressClickRef = useRef(false);
  const scheduleRef = useRef<() => void>(() => {});

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    originIndex: number;
  } | null>(null);

  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [motionOk, setMotionOk] = useState(true);
  const [step, setStep] = useState(280);
  const [animating, setAnimating] = useState(true);

  const items = Children.toArray(children);
  const count = items.length;

  const clearDwell = () => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  };

  const clearResume = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const pause = useCallback(() => {
    pausedRef.current = true;
    clearDwell();
    clearResume();
  }, []);

  const measureStep = useCallback(() => {
    const first = itemRefs.current[0];
    const second = itemRefs.current[1];
    if (first && second) {
      const next = second.offsetLeft - first.offsetLeft;
      if (next > 0) {
        stepRef.current = next;
        setStep(next);
        return next;
      }
    }
    if (first) {
      const next = first.offsetWidth + 16;
      stepRef.current = next;
      setStep(next);
      return next;
    }
    return stepRef.current;
  }, []);

  const jumpToLogical = useCallback((logical: number) => {
    setAnimating(false);
    indexRef.current = logical;
    setIndex(logical);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimating(true));
    });
  }, []);

  const applyIndex = useCallback(
    (next: number, withAnim: boolean) => {
      if (count === 0) return;

      let absolute = next;
      if (absolute < 0) absolute = count - 1;
      if (absolute > count) absolute = absolute % count;

      indexRef.current = absolute;
      setAnimating(withAnim && !reduceMotionRef.current);
      setIndex(absolute);
      setDragOffset(0);
      dragOffsetRef.current = 0;

      if (withAnim && absolute === count) {
        if (wrapTimerRef.current) clearTimeout(wrapTimerRef.current);
        wrapTimerRef.current = setTimeout(() => {
          jumpToLogical(0);
        }, slideMs + 30);
      }
    },
    [count, jumpToLogical, slideMs],
  );

  const goBy = useCallback(
    (dir: 1 | -1) => {
      if (count < 1) return;
      applyIndex(indexRef.current + dir, true);
    },
    [applyIndex, count],
  );

  const canRun = useCallback(() => {
    return shouldRunCoverflowAutoplay({
      reduceMotion: reduceMotionRef.current,
      paused: pausedRef.current,
      inView: inViewRef.current,
      pageVisible: pageVisibleRef.current,
      count,
      dragging: dragRef.current !== null,
    });
  }, [count]);

  const scheduleAdvance = useCallback(() => {
    clearDwell();
    if (!canRun()) return;
    dwellTimerRef.current = setTimeout(() => {
      if (!canRun()) return;
      goBy(1);
      dwellTimerRef.current = setTimeout(() => {
        scheduleRef.current();
      }, slideMs + 50);
    }, dwellMs);
  }, [canRun, dwellMs, goBy, slideMs]);

  useEffect(() => {
    scheduleRef.current = scheduleAdvance;
  }, [scheduleAdvance]);

  const scheduleResume = useCallback(() => {
    clearResume();
    if (reduceMotionRef.current) return;
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
      scheduleRef.current();
    }, 650);
  }, []);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => {
      hoverCapableRef.current = hoverMq.matches;
      reduceMotionRef.current = motionMq.matches;
      setMotionOk(!motionMq.matches);
      if (motionMq.matches) pause();
    };
    apply();
    motionMq.addEventListener("change", apply);
    hoverMq.addEventListener("change", apply);
    return () => {
      motionMq.removeEventListener("change", apply);
      hoverMq.removeEventListener("change", apply);
    };
  }, [pause]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const nowInView = entry.isIntersecting;
        const entered = nowInView && !inViewRef.current;
        inViewRef.current = nowInView;
        if (entered) {
          // Recover from a stale mobile pause (sticky hover / leftover tap focus).
          if (!dragRef.current && !keyboardFocusRef.current) {
            pausedRef.current = false;
          }
          scheduleRef.current();
        } else if (!nowInView) {
          clearDwell();
        }
      },
      { threshold: 0, rootMargin: "0px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () => {
      pageVisibleRef.current = document.visibilityState === "visible";
      if (pageVisibleRef.current && inViewRef.current && !dragRef.current) {
        if (!keyboardFocusRef.current) pausedRef.current = false;
        scheduleRef.current();
      } else {
        clearDwell();
      }
    };
    pageVisibleRef.current = document.visibilityState === "visible";
    document.addEventListener("visibilitychange", syncVisibility);
    window.addEventListener("pageshow", syncVisibility);
    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      window.removeEventListener("pageshow", syncVisibility);
    };
  }, []);

  useEffect(() => {
    measureStep();
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measureStep());
    ro.observe(root);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [measureStep, count]);

  useEffect(() => {
    if (motionOk) scheduleAdvance();
    return () => {
      clearDwell();
      clearResume();
      if (wrapTimerRef.current) clearTimeout(wrapTimerRef.current);
    };
  }, [scheduleAdvance, motionOk]);

  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (!motionOk || !hoverCapableRef.current) return;
    if (event.pointerType && event.pointerType !== "mouse") return;
    pause();
  };

  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (!motionOk || !hoverCapableRef.current) return;
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (dragRef.current) return;
    scheduleResume();
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!motionOk) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pause();
    suppressClickRef.current = false;
    dragOffsetRef.current = 0;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      originIndex: indexRef.current >= count ? 0 : indexRef.current,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) <= 6) return;
    if (!suppressClickRef.current) {
      suppressClickRef.current = true;
      setAnimating(false);
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // capture may already be held
      }
    }
    dragOffsetRef.current = dx;
    setDragOffset(dx);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }

    const didScrub = suppressClickRef.current;
    const threshold = Math.max(48, stepRef.current * 0.22);
    let next = drag.originIndex;
    if (dragOffsetRef.current <= -threshold) next += 1;
    else if (dragOffsetRef.current >= threshold) next -= 1;

    if (didScrub && next !== indexRef.current) {
      applyIndex(next, true);
    } else if (didScrub) {
      setDragOffset(0);
      dragOffsetRef.current = 0;
      setAnimating(true);
    }

    scheduleResume();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      pause();
      goBy(1);
      scheduleResume();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      pause();
      goBy(-1);
      scheduleResume();
    }
  };

  const onClickCapture = (event: MouseEvent) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  if (count === 0) return null;

  const trackOffset = -index * step + dragOffset;
  const focusLogical = index >= count ? 0 : index;

  const renderBand = (band: 0 | 1) =>
    items.map((child, i) => {
      if (!isValidElement(child)) return child;
      const element = child as ReactElement<{ className?: string }>;
      const showingActive =
        (index < count && band === 0 && i === index) ||
        (index === count && band === 1 && i === 0);

      const distance = Math.min(
        Math.abs(i - focusLogical),
        count - Math.abs(i - focusLogical),
      );

      const scale = motionOk
        ? showingActive
          ? activeScale
          : distance === 1
            ? sideScale
            : sideScale * 0.94
        : 1;

      return (
        <div
          key={`${band}-${element.key ?? i}`}
          ref={(node) => {
            if (band === 0) itemRefs.current[i] = node;
          }}
          className={cn(
            "shrink-0 origin-center will-change-transform",
            motionOk ? "transition-[transform,opacity] duration-500 ease-premium" : "",
          )}
          style={{
            transform: `scale(${scale})`,
            opacity: motionOk ? (showingActive ? 1 : distance === 1 ? 0.9 : 0.78) : 1,
            zIndex: showingActive ? 3 : distance === 1 ? 2 : 1,
          }}
          aria-hidden={band === 1 || !showingActive}
        >
          {cloneElement(element, {
            className: cn(
              element.props.className,
              "select-none",
              showingActive && motionOk
                ? "shadow-[0_18px_40px_hsl(186_30%_8%/0.32)]"
                : "shadow-[0_10px_24px_hsl(186_30%_8%/0.18)]",
            ),
          })}
        </div>
      );
    });

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative",
        "[mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]",
        className,
      )}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        role="region"
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        onClickCapture={onClickCapture}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) {
            keyboardFocusRef.current = true;
            pause();
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            keyboardFocusRef.current = false;
            scheduleResume();
          }
        }}
        className={cn(
          "overflow-hidden py-10 touch-pan-y sm:py-12",
          motionOk ? "cursor-grab active:cursor-grabbing" : "",
        )}
      >
        <div
          ref={trackRef}
          className={cn(
            "flex w-max flex-row items-center gap-3 px-[max(1rem,calc(50%-8.25rem))] sm:gap-4 sm:px-[max(1.25rem,calc(50%-9rem))]",
            trackClassName,
          )}
          style={{
            transform: `translate3d(${trackOffset}px, 0, 0)`,
            transition:
              animating && motionOk
                ? `transform ${slideMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
                : "none",
            willChange: "transform",
          }}
        >
          {renderBand(0)}
          {motionOk ? renderBand(1) : null}
        </div>
      </div>
    </div>
  );
}
