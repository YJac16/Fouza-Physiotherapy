import { z } from "zod";

const note = z.string().max(8000).optional().default("");

export const regionAnnotationSchema = z.object({
  regionId: z.string().min(1),
  view: z.enum(["anterior", "posterior"]),
  note: z.string().min(1).max(2000),
  pain: z.number().int().min(0).max(10).optional().nullable(),
});

export const subjectiveAssessmentSchema = z.object({
  presentHistory: z.object({
    kindOfDisorder: note,
    aggravatingFactors: note,
    easingFactors: note,
    twentyFourHourBehaviour: note,
    sin: note,
    mechanicalInflammatory: note,
  }).default({}),
  specialQuestions: z.object({
    redFlags: note,
    yellowFlags: note,
  }).default({}),
  otherResources: note,
  comparableSymptom: note,
  pastHistory: z.object({
    comorbidities: note,
    medications: note,
    previousEpisodes: note,
  }).default({}),
  socialHistory: z.object({
    homeEnvironment: note,
    occupation: note,
    hobbies: note,
    family: note,
    smokingAlcoholOther: note,
  }).default({}),
});

export const objectiveAssessmentSchema = z.object({
  observations: z.object({
    general: note,
    local: note,
  }).default({}),
  functionalTests: note,
  clearingTests: z.object({
    cervical: z.object({
      flex: note,
      ext: note,
      sflexL: note,
      sflexR: note,
      rotL: note,
      rotR: note,
    }).default({}),
    shoulder: z.object({
      flex: note,
      abd: note,
      hbb: note,
    }).default({}),
    wrist: z.object({
      flex: note,
      ext: note,
      radialDev: note,
      ulnarDev: note,
    }).default({}),
  }).default({}),
  activePassiveMovements: note,
  isometricTesting: note,
  specialTests: note,
  flexibility: note,
  palpation: note,
  muscleTesting: note,
  neurologicalTests: note,
  additionalMovements: note,
  outcomeMeasures: note,
});

export const initialAssessmentSchema = z.object({
  patientId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  chiefComplaint: z.string().optional(),
  history: z.string().optional(),
  painScale: z.number().int().min(0).max(10).optional().nullable(),
  observations: z.string().optional(),
  plan: z.string().optional(),
  regionNotes: z.array(regionAnnotationSchema).default([]),
  subjective: subjectiveAssessmentSchema.default({}),
  objective: objectiveAssessmentSchema.default({}),
});

export type RegionAnnotation = z.infer<typeof regionAnnotationSchema>;
export type SubjectiveAssessment = z.infer<typeof subjectiveAssessmentSchema>;
export type ObjectiveAssessment = z.infer<typeof objectiveAssessmentSchema>;
export type InitialAssessmentInput = z.infer<typeof initialAssessmentSchema>;

export const emptySubjective = (): SubjectiveAssessment =>
  subjectiveAssessmentSchema.parse({});

export const emptyObjective = (): ObjectiveAssessment =>
  objectiveAssessmentSchema.parse({});

function isFilled(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).some(isFilled);
}

export function parseSubjective(
  raw: unknown,
  fallback?: { history?: string | null; chiefComplaint?: string | null },
): SubjectiveAssessment {
  const parsed = subjectiveAssessmentSchema.safeParse(raw ?? {});
  const data = parsed.success ? parsed.data : emptySubjective();
  if (isFilled(data)) return data;

  const kindOfDisorder = [fallback?.chiefComplaint, fallback?.history]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join("\n\n");
  if (!kindOfDisorder) return data;
  return {
    ...data,
    presentHistory: {
      ...data.presentHistory,
      kindOfDisorder,
    },
  };
}

export function parseObjective(
  raw: unknown,
  fallback?: { observations?: string | null },
): ObjectiveAssessment {
  const parsed = objectiveAssessmentSchema.safeParse(raw ?? {});
  const data = parsed.success ? parsed.data : emptyObjective();
  if (isFilled(data)) return data;
  const observations = fallback?.observations?.trim();
  if (!observations) return data;
  return {
    ...data,
    observations: {
      ...data.observations,
      general: observations,
    },
  };
}

function joinNotes(values: Array<string | undefined | null>) {
  return values.map((value) => value?.trim()).filter(Boolean).join("\n\n");
}

export function summarizeAssessment(input: {
  subjective: SubjectiveAssessment;
  objective: ObjectiveAssessment;
  plan?: string;
}) {
  const chiefComplaint =
    input.subjective.presentHistory.kindOfDisorder.trim() ||
    input.subjective.comparableSymptom.trim() ||
    null;
  const history = joinNotes([
    input.subjective.presentHistory.kindOfDisorder,
    input.subjective.presentHistory.aggravatingFactors,
    input.subjective.presentHistory.easingFactors,
    input.subjective.specialQuestions.redFlags,
    input.subjective.pastHistory.comorbidities,
  ]);
  const observations = joinNotes([
    input.objective.observations.general,
    input.objective.observations.local,
    input.objective.functionalTests,
    input.objective.specialTests,
  ]);

  return {
    chiefComplaint,
    history: history || null,
    observations: observations || null,
    plan: input.plan?.trim() || null,
  };
}

function field(formData: FormData, key: string) {
  return formData.get(key)?.toString() ?? "";
}

export function subjectiveFromFormData(formData: FormData): SubjectiveAssessment {
  return subjectiveAssessmentSchema.parse({
    presentHistory: {
      kindOfDisorder: field(formData, "ph_kind"),
      aggravatingFactors: field(formData, "ph_aggravating"),
      easingFactors: field(formData, "ph_easing"),
      twentyFourHourBehaviour: field(formData, "ph_24h"),
      sin: field(formData, "ph_sin"),
      mechanicalInflammatory: field(formData, "ph_mech"),
    },
    specialQuestions: {
      redFlags: field(formData, "sq_red"),
      yellowFlags: field(formData, "sq_yellow"),
    },
    otherResources: field(formData, "other_resources"),
    comparableSymptom: field(formData, "comparable_symptom"),
    pastHistory: {
      comorbidities: field(formData, "pm_comorbidities"),
      medications: field(formData, "pm_medications"),
      previousEpisodes: field(formData, "pm_previous"),
    },
    socialHistory: {
      homeEnvironment: field(formData, "so_home"),
      occupation: field(formData, "so_occupation"),
      hobbies: field(formData, "so_hobbies"),
      family: field(formData, "so_family"),
      smokingAlcoholOther: field(formData, "so_smoking"),
    },
  });
}

export function objectiveFromFormData(formData: FormData): ObjectiveAssessment {
  return objectiveAssessmentSchema.parse({
    observations: {
      general: field(formData, "ob_general"),
      local: field(formData, "ob_local"),
    },
    functionalTests: field(formData, "functional_tests"),
    clearingTests: {
      cervical: {
        flex: field(formData, "ct_cervical_flex"),
        ext: field(formData, "ct_cervical_ext"),
        sflexL: field(formData, "ct_cervical_sflex_l"),
        sflexR: field(formData, "ct_cervical_sflex_r"),
        rotL: field(formData, "ct_cervical_rot_l"),
        rotR: field(formData, "ct_cervical_rot_r"),
      },
      shoulder: {
        flex: field(formData, "ct_shoulder_flex"),
        abd: field(formData, "ct_shoulder_abd"),
        hbb: field(formData, "ct_shoulder_hbb"),
      },
      wrist: {
        flex: field(formData, "ct_wrist_flex"),
        ext: field(formData, "ct_wrist_ext"),
        radialDev: field(formData, "ct_wrist_radial"),
        ulnarDev: field(formData, "ct_wrist_ulnar"),
      },
    },
    activePassiveMovements: field(formData, "active_passive"),
    isometricTesting: field(formData, "isometric"),
    specialTests: field(formData, "special_tests"),
    flexibility: field(formData, "flexibility"),
    palpation: field(formData, "palpation"),
    muscleTesting: field(formData, "muscle_testing"),
    neurologicalTests: field(formData, "neurological"),
    additionalMovements: field(formData, "additional_movements"),
    outcomeMeasures: field(formData, "outcome_measures"),
  });
}
