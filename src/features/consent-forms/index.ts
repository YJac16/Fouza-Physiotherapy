export {
  createConsentFormAction,
  createPatientWithStaffConsentAction,
  listConsentForms,
  signConsentAction,
  submitIntakeAction,
  submitFouzaConsentPackageAction,
  submitStaffConsentPackageAction,
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
export {
  buildSignaturePayload,
  portalConsentPatientUpdate,
  portalInviteFromAccountPayer,
  portalInviteFromConsentAnswers,
  portalInviteLinksPatientProfile,
  splitFullName,
  staffConsentPatientUpdate,
} from "./lib/staff-capture";
export { SignedConsentView } from "./components/signed-consent-view";
export const CONSENT_FORMS_FEATURE = "consent-forms" as const;
