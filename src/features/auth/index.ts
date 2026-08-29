import {
  ForgotPasswordForm,
  LoginForm,
  RegisterForm,
  ResetPasswordForm,
} from "@/features/auth/components/auth-forms";

export {
  forgotPasswordAction,
  inviteStaffAction,
  deactivateStaffAccessAction,
  cancelStaffInviteAction,
  resetPasswordAction,
  signInAction,
  signOutAction,
  signUpAction,
} from "@/features/auth/actions/auth";
export {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth";
export type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/features/auth/schemas/auth";

export const AUTH_FEATURE = "auth" as const;

export { ForgotPasswordForm, LoginForm, RegisterForm, ResetPasswordForm };
