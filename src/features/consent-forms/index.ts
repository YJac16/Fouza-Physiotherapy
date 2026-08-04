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
export {
  getSignedConsentPackage,
  getSignedConsentPackageAdmin,
} from "./lib/signed-package";
export { SignedConsentView } from "./components/signed-consent-view";
export const CONSENT_FORMS_FEATURE = "consent-forms" as const;
