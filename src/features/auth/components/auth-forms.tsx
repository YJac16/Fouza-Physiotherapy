"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  type AuthActionState,
  forgotPasswordAction,
  resetPasswordAction,
  signInAction,
  signUpAction,
} from "@/features/auth/actions/auth";
import { PasswordField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { routes } from "@/config/routes";

const initial: AuthActionState = {};

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);

  return (
    <form action={action} className="space-y-4">
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        required
      />
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="rememberMe"
          name="rememberMe"
          value="true"
          defaultChecked
          className="mt-1 size-4 shrink-0 rounded border border-input accent-primary"
        />
        <div className="space-y-1 leading-none">
          <Label htmlFor="rememberMe" className="font-normal">
            Remember me on this device
          </Label>
          <p className="text-xs text-muted-foreground">
            Stay signed in for 30 days. Uncheck on shared clinic computers.
          </p>
        </div>
      </div>
      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      <Button type="submit" className="w-full" loading={pending}>
        Sign in
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href={routes.auth.forgotPassword} className="text-primary hover:underline">
          Forgot password?
        </Link>
        {" · "}
        <Link href={routes.auth.register} className="text-primary hover:underline">
          Create account
        </Link>
      </p>
      <p className="text-center text-sm">
        <Link href={routes.marketing.home} className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(signUpAction, initial);

  return (
    <form action={action} className="space-y-4">
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="new-password"
        required
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        required
      />
      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
      <Button type="submit" className="w-full" loading={pending}>
        Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={routes.auth.login} className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
      <p className="text-center text-sm">
        <Link href={routes.marketing.home} className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
      <Button type="submit" className="w-full" loading={pending}>
        Send reset link
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href={routes.auth.login} className="text-primary hover:underline">
          Back to sign in
        </Link>
        {" · "}
        <Link href={routes.marketing.home} className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={action} className="space-y-4">
      <PasswordField
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        required
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        required
      />
      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      <Button type="submit" className="w-full" loading={pending}>
        Update password
      </Button>
      <p className="text-center text-sm">
        <Link href={routes.marketing.home} className="text-primary hover:underline">
          Back to home
        </Link>
      </p>
    </form>
  );
}
