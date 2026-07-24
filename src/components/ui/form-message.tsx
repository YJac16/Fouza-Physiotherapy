import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  tone?: "error" | "success" | "info" | "loading";
}

function FormMessage({
  className,
  tone = "error",
  children,
  ...props
}: FormMessageProps) {
  if (!children) return null;

  const Icon =
    tone === "success"
      ? CheckCircle2
      : tone === "info"
        ? Info
        : tone === "loading"
          ? Loader2
          : AlertCircle;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-1.5 text-sm",
        tone === "error" && "text-destructive",
        tone === "success" && "text-success",
        tone === "info" && "text-info",
        tone === "loading" && "text-muted-foreground",
        className,
      )}
      {...props}
    >
      <Icon
        className={cn("mt-0.5 size-3.5 shrink-0", tone === "loading" && "animate-spin")}
        aria-hidden
      />
      <span>{children}</span>
    </p>
  );
}

export { FormMessage };
