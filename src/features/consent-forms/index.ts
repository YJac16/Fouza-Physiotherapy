export {
  createConsentFormAction,
  listConsentForms,
  signConsentAction,
  submitIntakeAction,
  submitFouzaConsentPackageAction,
} from "./actions/consent";
export {
  getPatientConsentCompletion,
  getPatientConsentCompletionAdmin,
  INTAKE_SLUG,
  REQUIRED_CONSENT_SLUGS,
} from "./lib/completion";
export const CONSENT_FORMS_FEATURE = "consent-forms" as const;
