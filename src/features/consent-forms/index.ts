export {
  createConsentFormAction,
  listConsentForms,
  signConsentAction,
  submitIntakeAction,
  submitFouzaConsentPackageAction,
  setPatientVerifiedAction,
} from "./actions/consent";
export {
  getPatientConsentCompletion,
  getPatientConsentCompletionAdmin,
  syncPatientConsentFlagsIfComplete,
  INTAKE_SLUG,
  REQUIRED_CONSENT_SLUGS,
} from "./lib/completion";
export {
  getSignedConsentPackage,
  getSignedConsentPackageAdmin,
} from "./lib/signed-package";
export type {
  SignedConsentPackage,
  SignedConsentSignature,
} from "./lib/signed-package-types";
export {
  INTAKE_ANSWER_LABELS,
  formatIntakeAnswerValue,
} from "./lib/signed-package-types";
export { SignedConsentView } from "./components/signed-consent-view";
export const CONSENT_FORMS_FEATURE = "consent-forms" as const;
