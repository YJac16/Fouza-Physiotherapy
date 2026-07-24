import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  page: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-2", className)}
      {...props}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={!canPrev}
        aria-label="Previous page"
        onClick={() => onPageChange?.(page - 1)}
      >
        <ChevronLeft />
      </Button>
      <span className="min-w-[6rem] text-center text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={!canNext}
        aria-label="Next page"
        onClick={() => onPageChange?.(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  );
}

export { Pagination };
