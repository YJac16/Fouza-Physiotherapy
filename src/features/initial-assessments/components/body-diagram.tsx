"use client";

import { cn } from "@/lib/utils";
import {
  annotationKey,
  regionsForView,
  type BodyView,
} from "@/features/initial-assessments/lib/body-regions";
import type { RegionAnnotation } from "@/features/initial-assessments/schemas/assessment";

type BodyDiagramProps = {
  view: BodyView;
  annotations: RegionAnnotation[];
  selectedKey?: string | null;
  interactive?: boolean;
  onSelectRegion?: (regionId: string, view: BodyView) => void;
  className?: string;
};

export function BodyDiagram({
  view,
  annotations,
  selectedKey,
  interactive = true,
  onSelectRegion,
  className,
}: BodyDiagramProps) {
  const regions = regionsForView(view);
  const marked = new Set(
    annotations.filter((a) => a.view === view).map((a) => annotationKey(a.regionId, a.view)),
  );

  return (
    <div className={cn("mx-auto w-full max-w-xs touch-manipulation select-none", className)}>
      <svg
        viewBox="0 0 200 360"
        className="h-auto w-full"
        role={interactive ? "group" : "img"}
        aria-label={`${view === "anterior" ? "Front" : "Back"} body diagram`}
      >
        {/* Silhouette outline for context */}
        <path
          d="M100 6
            c18 0 28 14 28 32
            v12
            h22 c8 0 14 6 14 14 v28
            c0 8-4 12-10 14
            l-8 4 v36
            c0 6 2 10 6 14
            l10 12 v36
            c0 6-4 10-10 10 h-8
            v70
            c0 14-6 28-8 42
            h-18
            c-2-14-8-28-8-42
            v-70 h-8
            c-6 0-10-4-10-10
            v-36
            l10-12
            c4-4 6-8 6-14
            v-36
            l-8-4
            c-6-2-10-6-10-14
            v-28
            c0-8 6-14 14-14
            h22 v-12
            c0-18 10-32 28-32 z"
          fill="currentColor"
          className="text-muted/25"
          pointerEvents="none"
        />

        {regions.map((region) => {
          const key = annotationKey(region.id, region.view);
          const isMarked = marked.has(key);
          const isSelected = selectedKey === key;

          return (
            <path
              key={key}
              d={region.path}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={region.label}
              aria-pressed={interactive ? isMarked : undefined}
              className={cn(
                "stroke-border transition-colors",
                interactive && "cursor-pointer outline-none focus-visible:stroke-2 focus-visible:stroke-primary",
                isSelected
                  ? "fill-primary/45 stroke-primary"
                  : isMarked
                    ? "fill-primary/30 stroke-primary/80"
                    : "fill-background/80 hover:fill-primary/15",
              )}
              strokeWidth={isSelected ? 2 : 1}
              onClick={
                interactive && onSelectRegion
                  ? () => onSelectRegion(region.id, region.view)
                  : undefined
              }
              onKeyDown={
                interactive && onSelectRegion
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectRegion(region.id, region.view);
                      }
                    }
                  : undefined
              }
            />
          );
        })}
      </svg>
    </div>
  );
}
