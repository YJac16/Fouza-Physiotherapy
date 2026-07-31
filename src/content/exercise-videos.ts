export type ExerciseVideoRegion = "ankle" | "hip" | "knee" | "lumbar";

export type ExerciseVideoEntry = {
  slug: string;
  title: string;
  category: ExerciseVideoRegion;
  /** Path inside the Supabase `exercise-media` bucket after upload */
  storagePath: string;
  /** Prefer compressing large files before upload for reliable patient streaming */
  notes?: string;
};

/**
 * Catalogue of lower-limb clinical demo videos for the exercise library.
 * Files live locally under `public/Lower limb videos/` (gitignored) and should be
 * uploaded to Supabase `exercise-media` at the `storagePath` below.
 */
export const lowerLimbExerciseVideos: ExerciseVideoEntry[] = [
  {
    slug: "clearing-test-squat",
    title: "Clearing test — squat",
    category: "ankle",
    storagePath: "lower-limb/ankle/clearing-test-squat.mp4",
  },
  {
    slug: "flexibility-test-active-knee-ext",
    title: "Flexibility test — active knee extension",
    category: "ankle",
    storagePath: "lower-limb/ankle/flexibility-test-active-knee-ext.mp4",
  },
  {
    slug: "ankle-palpation",
    title: "Ankle palpation",
    category: "ankle",
    storagePath: "lower-limb/ankle/ankle-palpation.mp4",
    notes: "Large file — compress before upload if possible",
  },
  {
    slug: "hip-isometric-abd-add",
    title: "Hip isometric abduction and adduction",
    category: "hip",
    storagePath: "lower-limb/hip/hip-isometric-abd-add.mp4",
  },
  {
    slug: "hip-palpation",
    title: "Hip palpation",
    category: "hip",
    storagePath: "lower-limb/hip/hip-palpation.mp4",
    notes: "Large file — compress before upload if possible",
  },
  {
    slug: "piriformis-length-test",
    title: "Flexibility test — piriformis length",
    category: "hip",
    storagePath: "lower-limb/hip/piriformis-length-test.mp4",
  },
  {
    slug: "thomas-test",
    title: "Flexibility test — Thomas test",
    category: "hip",
    storagePath: "lower-limb/hip/thomas-test.mp4",
  },
  {
    slug: "nms-functional-tests-lower",
    title: "NMS functional tests — lower limb",
    category: "hip",
    storagePath: "lower-limb/hip/nms-functional-tests-lower.mp4",
    notes: "Convert the source .m4v to .mp4 before upload for browser playback",
  },
  {
    slug: "knee-flexibility-active-knee-ext",
    title: "Flexibility test — active knee extension",
    category: "knee",
    storagePath: "lower-limb/knee/flexibility-test-active-knee-ext.mp4",
  },
  {
    slug: "lumbar-spine-assessment",
    title: "Lumbar spine assessment",
    category: "lumbar",
    storagePath: "lower-limb/lumbar/lumbar-spine-assessment.mp4",
    notes: "Large file — compress before upload if possible",
  },
];

export function exerciseVideosByCategory(category: ExerciseVideoRegion) {
  return lowerLimbExerciseVideos.filter((v) => v.category === category);
}
