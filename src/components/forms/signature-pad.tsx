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
  const [drawing, setDrawing] = React.useState(false);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  function pointerPos(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
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

  function end() {
    setDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");
    setValue(data);
    onChange?.(data);
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setValue("");
    onChange?.("");
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="h-36 w-full max-w-full touch-none rounded-2xl border border-dashed border-border bg-secondary/40"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        aria-label={label}
      />
      <input type="hidden" name={name} value={value} />
      <Button type="button" variant="outline" size="sm" onClick={clear}>
        Clear signature
      </Button>
    </div>
  );
}
