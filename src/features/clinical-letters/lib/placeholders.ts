export type LetterPlaceholderValues = Record<string, string | null | undefined>;

const PLACEHOLDER = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export function applyLetterPlaceholders(template: string, values: LetterPlaceholderValues) {
  return template.replace(PLACEHOLDER, (_, key: string) => {
    const value = values[key];
    if (value == null) return "";
    return String(value);
  });
}

export function formatLetterDate(isoDate: string) {
  const d = new Date(isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  });
}

export function ageFromDateOfBirth(dob?: string | null, onDate?: string | null) {
  if (!dob) return "";
  const birth = new Date(`${dob}T12:00:00`);
  const on = new Date(`${onDate || new Date().toISOString().slice(0, 10)}T12:00:00`);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(on.getTime())) return "";
  let age = on.getFullYear() - birth.getFullYear();
  const monthDelta = on.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && on.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 && age < 130 ? String(age) : "";
}

export function pronounsFromSex(sex?: string | null) {
  const normalized = (sex ?? "").trim().toLowerCase();
  if (["female", "woman", "girl", "f", "she", "her"].includes(normalized)) {
    return {
      pronounSubject: "she",
      pronounPossessive: "her",
      pronounObject: "her",
      pronounSubjectCap: "She",
    };
  }
  if (["male", "man", "boy", "m", "he", "him", "his"].includes(normalized)) {
    return {
      pronounSubject: "he",
      pronounPossessive: "his",
      pronounObject: "him",
      pronounSubjectCap: "He",
    };
  }
  return {
    pronounSubject: "they",
    pronounPossessive: "their",
    pronounObject: "them",
    pronounSubjectCap: "They",
  };
}

export function patientSexLabel(sex?: string | null) {
  const normalized = (sex ?? "").trim().toLowerCase();
  if (["female", "woman", "girl", "f", "she", "her"].includes(normalized)) return "female";
  if (["male", "man", "boy", "m", "he", "him", "his"].includes(normalized)) return "male";
  if (!normalized) return "";
  return "person";
}

export function buildLetterPlaceholderValues(input: {
  patientName: string;
  practiceName: string;
  letterDate: string;
  attendanceDate?: string | null;
  patientAge?: string | null;
  patientSex?: string | null;
  recipientName?: string | null;
  presentingComplaint?: string | null;
  findings?: string | null;
  recommendations?: string | null;
}) {
  const pronouns = pronounsFromSex(input.patientSex);
  return {
    patientName: input.patientName,
    practiceName: input.practiceName,
    letterDate: formatLetterDate(input.letterDate),
    attendanceDate: input.attendanceDate ? formatLetterDate(input.attendanceDate) : formatLetterDate(input.letterDate),
    patientAge: input.patientAge?.trim() || "",
    patientSex: patientSexLabel(input.patientSex),
    recipientName: input.recipientName?.trim() || "",
    presentingComplaint: input.presentingComplaint?.trim() || "[presenting complaint]",
    findings: input.findings?.trim() || "[assessment findings]",
    recommendations: input.recommendations?.trim() || "[recommendations]",
    ...pronouns,
  };
}
