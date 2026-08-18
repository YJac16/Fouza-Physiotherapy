import { describe, expect, it } from "vitest";

import {
  emptyObjective,
  emptySubjective,
  parseObjective,
  parseSubjective,
  subjectiveFromFormData,
  summarizeAssessment,
} from "@/features/initial-assessments/schemas/assessment";

describe("assessment schema", () => {
  it("maps empty JSON to legacy history text", () => {
    const subjective = parseSubjective({}, { chiefComplaint: "Knee pain", history: "Onset last week" });
    expect(subjective.presentHistory.kindOfDisorder).toContain("Knee pain");
    expect(subjective.presentHistory.kindOfDisorder).toContain("Onset last week");
  });

  it("keeps structured subjective over legacy fallback", () => {
    const subjective = parseSubjective(
      { presentHistory: { kindOfDisorder: "Shoulder pain after fall" } },
      { history: "old free text" },
    );
    expect(subjective.presentHistory.kindOfDisorder).toBe("Shoulder pain after fall");
  });

  it("maps legacy observations into objective general notes", () => {
    const objective = parseObjective({}, { observations: "Antalgic gait" });
    expect(objective.observations.general).toBe("Antalgic gait");
  });

  it("summarises chief complaint from present history", () => {
    const summary = summarizeAssessment({
      subjective: {
        ...emptySubjective(),
        presentHistory: {
          ...emptySubjective().presentHistory,
          kindOfDisorder: "Lumbar pain",
        },
      },
      objective: emptyObjective(),
      plan: "Mobilise and review",
    });
    expect(summary.chiefComplaint).toBe("Lumbar pain");
    expect(summary.plan).toBe("Mobilise and review");
  });

  it("reads subjective fields from form data", () => {
    const formData = new FormData();
    formData.set("ph_kind", "Ankle sprain");
    formData.set("sq_red", "None");
    const subjective = subjectiveFromFormData(formData);
    expect(subjective.presentHistory.kindOfDisorder).toBe("Ankle sprain");
    expect(subjective.specialQuestions.redFlags).toBe("None");
  });
});
