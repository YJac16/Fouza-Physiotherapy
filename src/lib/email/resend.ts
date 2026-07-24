import { Resend } from "resend";

/**
 * Lazy Resend client — instantiated on first server use.
 */
let resendClient: Resend | null = null;

export function getResend() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured.");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export const emailDefaults = {
  get from() {
    return process.env.RESEND_FROM_EMAIL ?? "noreply@localhost";
  },
  get replyTo() {
    return process.env.RESEND_REPLY_TO;
  },
};
