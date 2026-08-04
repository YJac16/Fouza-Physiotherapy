export type BodyView = "anterior" | "posterior";

export type BodyRegionDef = {
  id: string;
  label: string;
  view: BodyView;
  /** SVG path `d` for the hit/display shape */
  path: string;
};

/** Simplified full-body SVG regions (viewBox 0 0 200 480). Large enough for touch. */
export const BODY_REGIONS: BodyRegionDef[] = [
  // —— Anterior ——
  {
    id: "head",
    label: "Head",
    view: "anterior",
    path: "M85 8 h30 a18 22 0 0 1 0 44 h-30 a18 22 0 0 1 0-44 z",
  },
  {
    id: "cervical",
    label: "Neck",
    view: "anterior",
    path: "M90 52 h20 v18 h-20 z",
  },
  {
    id: "right_shoulder",
    label: "R shoulder",
    view: "anterior",
    path: "M48 70 h38 v28 h-38 z",
  },
  {
    id: "left_shoulder",
    label: "L shoulder",
    view: "anterior",
    path: "M114 70 h38 v28 h-38 z",
  },
  {
    id: "thoracic",
    label: "Chest / thoracic",
    view: "anterior",
    path: "M78 70 h44 v55 h-44 z",
  },
  {
    id: "right_elbow",
    label: "R elbow / upper arm",
    view: "anterior",
    path: "M38 98 h28 v50 h-28 z",
  },
  {
    id: "left_elbow",
    label: "L elbow / upper arm",
    view: "anterior",
    path: "M134 98 h28 v50 h-28 z",
  },
  {
    id: "right_wrist_hand",
    label: "R wrist / hand",
    view: "anterior",
    path: "M32 148 h28 v40 h-28 z",
  },
  {
    id: "left_wrist_hand",
    label: "L wrist / hand",
    view: "anterior",
    path: "M140 148 h28 v40 h-28 z",
  },
  {
    id: "lumbar",
    label: "Abdomen / lumbar",
    view: "anterior",
    path: "M78 125 h44 v50 h-44 z",
  },
  {
    id: "right_hip",
    label: "R hip",
    view: "anterior",
    path: "M70 175 h30 v40 h-30 z",
  },
  {
    id: "left_hip",
    label: "L hip",
    view: "anterior",
    path: "M100 175 h30 v40 h-30 z",
  },
  {
    id: "right_knee",
    label: "R knee / thigh",
    view: "anterior",
    path: "M72 215 h26 v70 h-26 z",
  },
  {
    id: "left_knee",
    label: "L knee / thigh",
    view: "anterior",
    path: "M102 215 h26 v70 h-26 z",
  },
  {
    id: "right_ankle_foot",
    label: "R ankle / foot",
    view: "anterior",
    path: "M70 285 h28 v55 h-28 z",
  },
  {
    id: "left_ankle_foot",
    label: "L ankle / foot",
    view: "anterior",
    path: "M102 285 h28 v55 h-28 z",
  },

  // —— Posterior (mirrored layout; L/R from patient's perspective stays anatomical) ——
  {
    id: "head",
    label: "Head",
    view: "posterior",
    path: "M85 8 h30 a18 22 0 0 1 0 44 h-30 a18 22 0 0 1 0-44 z",
  },
  {
    id: "cervical",
    label: "Neck",
    view: "posterior",
    path: "M90 52 h20 v18 h-20 z",
  },
  {
    id: "left_shoulder",
    label: "L shoulder",
    view: "posterior",
    path: "M48 70 h38 v28 h-38 z",
  },
  {
    id: "right_shoulder",
    label: "R shoulder",
    view: "posterior",
    path: "M114 70 h38 v28 h-38 z",
  },
  {
    id: "thoracic",
    label: "Upper back / thoracic",
    view: "posterior",
    path: "M78 70 h44 v55 h-44 z",
  },
  {
    id: "left_elbow",
    label: "L elbow / upper arm",
    view: "posterior",
    path: "M38 98 h28 v50 h-28 z",
  },
  {
    id: "right_elbow",
    label: "R elbow / upper arm",
    view: "posterior",
    path: "M134 98 h28 v50 h-28 z",
  },
  {
    id: "left_wrist_hand",
    label: "L wrist / hand",
    view: "posterior",
    path: "M32 148 h28 v40 h-28 z",
  },
  {
    id: "right_wrist_hand",
    label: "R wrist / hand",
    view: "posterior",
    path: "M140 148 h28 v40 h-28 z",
  },
  {
    id: "lumbar",
    label: "Lower back / lumbar",
    view: "posterior",
    path: "M78 125 h44 v50 h-44 z",
  },
  {
    id: "left_hip",
    label: "L hip / glute",
    view: "posterior",
    path: "M70 175 h30 v40 h-30 z",
  },
  {
    id: "right_hip",
    label: "R hip / glute",
    view: "posterior",
    path: "M100 175 h30 v40 h-30 z",
  },
  {
    id: "left_knee",
    label: "L knee / thigh",
    view: "posterior",
    path: "M72 215 h26 v70 h-26 z",
  },
  {
    id: "right_knee",
    label: "R knee / thigh",
    view: "posterior",
    path: "M102 215 h26 v70 h-26 z",
  },
  {
    id: "left_ankle_foot",
    label: "L ankle / foot",
    view: "posterior",
    path: "M70 285 h28 v55 h-28 z",
  },
  {
    id: "right_ankle_foot",
    label: "R ankle / foot",
    view: "posterior",
    path: "M102 285 h28 v55 h-28 z",
  },
];

export function regionsForView(view: BodyView): BodyRegionDef[] {
  return BODY_REGIONS.filter((r) => r.view === view);
}

export function regionLabel(regionId: string, view: BodyView): string {
  const match = BODY_REGIONS.find((r) => r.id === regionId && r.view === view);
  if (match) return match.label;
  return BODY_REGIONS.find((r) => r.id === regionId)?.label ?? regionId;
}

export function annotationKey(regionId: string, view: BodyView): string {
  return `${view}:${regionId}`;
}
