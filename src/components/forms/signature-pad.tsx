"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SignaturePadProps {
  name?: string;
  label?: string;
  className?: string;
  onChange?: (dataUrl: string) => void;
}

/** Lightweight canvas signature capture for consent forms. */
export function SignaturePad({
  name = "signatureData",
  label = "Patient signature",
  className,
  onChange,
}: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = React.useState(false);
  const [value, setValue] = React.useState("");

  const syncCanvasSize = React.useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = Math.max(Math.floor(container.clientWidth), 1);
    const height = 160;
    const prev = canvas.toDataURL("image/png");

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (value || (prev && prev.length > 100)) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = value || prev;
    }
  }, [value]);

  React.useEffect(() => {
    syncCanvasSize();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => syncCanvasSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [syncCanvasSize]);

  function pointerPos(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = pointerPos(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pointerPos(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    setDrawing(false);
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");
    setValue(data);
    onChange?.(data);
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setValue("");
    onChange?.("");
  }

  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <Label>{label}</Label>
      <div ref={containerRef} className="min-w-0 w-full">
        <canvas
          ref={canvasRef}
          className="block h-40 w-full max-w-full touch-none rounded-2xl border border-dashed border-border bg-secondary/40"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          aria-label={label}
        />
      </div>
      <input type="hidden" name={name} value={value} />
      <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={clear}>
        Clear signature
      </Button>
    </div>
  );
}
