export {
  getDashboardMetrics,
  getPracticeSetting,
  setPracticeSetting,
} from "./api/settings";
export {
  savePracticeSettingsAction,
  type SettingsActionState,
} from "./actions/settings";
export { PracticeSettingsForm } from "./components/settings-form";

export const PRACTICE_FEATURE = "practice" as const;
