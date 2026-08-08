"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, MessageCircle } from "lucide-react";

import {
  BookingProgressIndicator,
  BookingSummaryCard,
  PractitionerCard,
  TimeSlotCard,
  TreatmentCard,
} from "@/components/booking";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import {
  type BookingActionState,
  confirmBookingAction,
  createHoldAction,
  fetchSlotsAction,
} from "@/features/booking/actions/booking";
import type { BookingPatientContext } from "@/features/booking/lib/eligibility";
import { BOOKING_TIMEZONE } from "@/features/booking/lib/timezone";
import { cn } from "@/lib/utils";

export type BookableService = {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
};

export type BookablePractitioner = {
  id: string;
  title: string;
  profile_id: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

export interface BookingWizardProps {
  services: BookableService[];
  practitioners: BookablePractitioner[];
  patientContext?: BookingPatientContext | null;
  isAuthenticated?: boolean;
  className?: string;
}

const STEPS = [
  { label: "Service", description: "Choose your treatment" },
  { label: "Practitioner", description: "Select your therapist" },
  { label: "Date & time", description: "Pick a slot" },
  { label: "Details", description: "Your contact info" },
  { label: "Confirm", description: "Review & book" },
] as const;

const initialConfirmState: BookingActionState = {};

function getDateKeyInTimezone(date = new Date(), timeZone = BOOKING_TIMEZONE) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function getPractitionerName(practitioner: BookablePractitioner) {
  const profile = practitioner.profiles;
  if (!profile) return practitioner.title;
  if (Array.isArray(profile)) return profile[0]?.full_name ?? practitioner.title;
  return profile.full_name ?? practitioner.title;
}

function formatBookingDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: BOOKING_TIMEZONE,
  });
}

function SetmoreFallback({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
      {message ? <p className="text-muted-foreground">{message}</p> : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="sm" variant="outline">
          <a href={siteConfig.bookingExternalUrl} target="_blank" rel="noopener noreferrer">
            Book via Setmore
          </a>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp us
          </a>
        </Button>
      </div>
    </div>
  );
}

export function BookingWizard({
  services,
  practitioners,
  patientContext = null,
  isAuthenticated = false,
  className,
}: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [practitionerId, setPractitionerId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<BookingActionState["slots"]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    startsAt: string;
    endsAt: string;
    label: string;
  } | null>(null);
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [holdingSlot, setHoldingSlot] = useState(false);
  const [details, setDetails] = useState({
    firstName: patientContext?.firstName ?? "",
    lastName: patientContext?.lastName ?? "",
    email: patientContext?.email ?? "",
    phone: patientContext?.phone ?? "",
  });
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmBookingAction,
    initialConfirmState,
  );

  const needsAuth = !isAuthenticated;
  const needsConsentForms = Boolean(patientContext?.needsConsent);
  const bookingBlocked = needsAuth || needsConsentForms;
  const consentReturnTo = `${routes.booking.root}`;
  const consentHref = `${routes.portal.forms}?returnTo=${encodeURIComponent(consentReturnTo)}`;
  const loginHref = `${routes.auth.login}?redirectTo=${encodeURIComponent(consentHref)}`;
  const registerHref = `${routes.auth.register}?redirectTo=${encodeURIComponent(consentHref)}`;

  const minDate = useMemo(() => getDateKeyInTimezone(), []);
  const selectedService = services.find((s) => s.id === serviceId) ?? null;
  const selectedPractitioner = practitioners.find((p) => p.id === practitionerId) ?? null;

  useEffect(() => {
    if (!patientContext) return;
    setDetails((current) => ({
      firstName: current.firstName || patientContext.firstName,
      lastName: current.lastName || patientContext.lastName,
      email: current.email || patientContext.email,
      phone: current.phone || patientContext.phone,
    }));
  }, [patientContext]);

  const loadSlots = useCallback(
    async (nextDate: string) => {
      if (!practitionerId || !serviceId || !nextDate) return;
      setLoadingSlots(true);
      setSlotsError(null);
      setSlots([]);
      setSelectedSlot(null);
      setHoldToken(null);

      const result = await fetchSlotsAction({
        practitionerId,
        serviceId,
        date: nextDate,
      });

      setLoadingSlots(false);
      if (result.error) {
        setSlotsError(result.error);
        return;
      }
      setSlots(result.slots ?? []);
      if (!result.slots?.length) {
        setSlotsError("No available times on this date.");
      }
    },
    [practitionerId, serviceId],
  );

  useEffect(() => {
    if (date) void loadSlots(date);
  }, [date, loadSlots]);

  useEffect(() => {
    if (confirmState.appointmentId) {
      router.push(`${routes.booking.success}?id=${confirmState.appointmentId}`);
    }
  }, [confirmState.appointmentId, router]);

  async function handleSlotSelect(slot: { startsAt: string; endsAt: string; label: string }) {
    if (!practitionerId || !serviceId) return;
    setSelectedSlot(slot);
    setHoldError(null);
    setHoldingSlot(true);

    const result = await createHoldAction({
      practitionerId,
      serviceId,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      email: details.email || undefined,
    });

    setHoldingSlot(false);
    if (result.error || !result.holdToken) {
      setHoldError(result.error ?? "Unable to reserve this slot.");
      setSelectedSlot(null);
      setHoldToken(null);
      return;
    }
    setHoldToken(result.holdToken);
  }

  function canContinue() {
    switch (step) {
      case 1:
        return Boolean(serviceId);
      case 2:
        return Boolean(practitionerId);
      case 3:
        return Boolean(date && selectedSlot && holdToken && !holdingSlot);
      case 4:
        return (
          details.firstName.trim().length > 0 &&
          details.lastName.trim().length > 0 &&
          details.email.includes("@") &&
          details.phone.trim().length >= 7
        );
      default:
        return true;
    }
  }

  function goNext() {
    if (!canContinue()) return;
    setStep((current) => Math.min(current + 1, STEPS.length));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 1));
  }

  const summaryItems =
    selectedService && selectedPractitioner && selectedSlot
      ? [
          { label: "Service", value: selectedService.name },
          { label: "Practitioner", value: getPractitionerName(selectedPractitioner) },
          { label: "Date", value: formatBookingDate(selectedSlot.startsAt) },
          { label: "Time", value: selectedSlot.label },
          { label: "Duration", value: formatDuration(selectedService.duration_minutes) },
          { label: "Name", value: `${details.firstName} ${details.lastName}`.trim() },
          { label: "Email", value: details.email },
          { label: "Phone", value: details.phone },
        ]
      : [];

  return (
    <div className={cn("min-w-0 space-y-8", className)}>
      <BookingProgressIndicator steps={[...STEPS]} currentStep={step} />

      {!patientContext?.canBookFollowUps ? (
        <FormMessage tone="info">
          New patients can book an Initial Consultation or Injury Prevention Assessment. Follow-up
          appointments unlock after verified account status and informed consent.
        </FormMessage>
      ) : null}

      {step === 1 ? (
        <section aria-labelledby="booking-step-service">
          <Typography as="h2" id="booking-step-service" variant="h3" className="mb-2">
            Select a service
          </Typography>
          <Typography variant="small" className="mb-6 text-muted-foreground">
            Choose the treatment you&apos;d like to book.
          </Typography>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <TreatmentCard
                key={service.id}
                name={service.name}
                duration={formatDuration(service.duration_minutes)}
                price={formatPrice(service.price_cents)}
                description={service.description ?? undefined}
                selected={serviceId === service.id}
                onSelect={() => setServiceId(service.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section aria-labelledby="booking-step-practitioner">
          <Typography as="h2" id="booking-step-practitioner" variant="h3" className="mb-2">
            Select a practitioner
          </Typography>
          <Typography variant="small" className="mb-6 text-muted-foreground">
            All appointments are with our registered physiotherapy team.
          </Typography>
          <div className="grid gap-4 md:grid-cols-2">
            {practitioners.map((practitioner) => (
              <PractitionerCard
                key={practitioner.id}
                name={getPractitionerName(practitioner)}
                role={practitioner.title}
                selected={practitionerId === practitioner.id}
                onSelect={() => setPractitionerId(practitioner.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section aria-labelledby="booking-step-datetime">
          <Typography as="h2" id="booking-step-datetime" variant="h3" className="mb-2">
            Choose date &amp; time
          </Typography>
          <Typography variant="small" className="mb-6 text-muted-foreground">
            Times shown in South Africa (Johannesburg).
          </Typography>

          <div className="space-y-2">
            <Label htmlFor="booking-date">Date</Label>
            <div className="relative max-w-xs">
              <Calendar
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="booking-date"
                type="date"
                min={minDate}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {date ? (
            <div className="mt-6">
              {loadingSlots ? (
                <FormMessage tone="loading">Loading available times…</FormMessage>
              ) : slotsError ? (
                <div className="space-y-4">
                  <FormMessage tone="error">{slotsError}</FormMessage>
                  <SetmoreFallback message="Try another date, book via Setmore, or call the practice." />
                </div>
              ) : (
                <>
                  <Typography variant="small" className="mb-3 font-medium">
                    Available times
                  </Typography>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {(slots ?? []).map((slot) => (
                      <TimeSlotCard
                        key={slot.startsAt}
                        time={slot.label}
                        selected={selectedSlot?.startsAt === slot.startsAt}
                        disabled={holdingSlot}
                        onClick={() => void handleSlotSelect(slot)}
                      />
                    ))}
                  </div>
                  {holdingSlot ? (
                    <FormMessage tone="loading" className="mt-4">
                      Reserving your slot…
                    </FormMessage>
                  ) : null}
                  {holdError ? (
                    <div className="mt-4 space-y-3">
                      <FormMessage tone="error">{holdError}</FormMessage>
                      <SetmoreFallback />
                    </div>
                  ) : null}
                  {holdToken && selectedSlot ? (
                    <FormMessage tone="success" className="mt-4">
                      {selectedSlot.label} on {formatBookingDate(selectedSlot.startsAt)} — held for
                      10 minutes.
                    </FormMessage>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </section>
      ) : null}

      {step === 4 ? (
        <section aria-labelledby="booking-step-details">
          <Typography as="h2" id="booking-step-details" variant="h3" className="mb-2">
            Your details
          </Typography>
          <Typography variant="small" className="mb-6 text-muted-foreground">
            {patientContext
              ? "We’ve filled these from your profile — edit if anything needs updating."
              : "We’ll use this to confirm your appointment and send reminders."}
          </Typography>
          <div className="grid max-w-lg gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={details.firstName}
                onChange={(event) =>
                  setDetails((current) => ({ ...current, firstName: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Surname</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={details.lastName}
                onChange={(event) =>
                  setDetails((current) => ({ ...current, lastName: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={details.email}
                onChange={(event) =>
                  setDetails((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={details.phone}
                onChange={(event) =>
                  setDetails((current) => ({ ...current, phone: event.target.value }))
                }
                required
              />
            </div>
          </div>
        </section>
      ) : null}

      {step === 5 ? (
        <section aria-labelledby="booking-step-confirm" className="grid gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <Typography as="h2" id="booking-step-confirm" variant="h3" className="mb-2">
              Confirm your booking
            </Typography>
            <Typography variant="small" className="mb-6 text-muted-foreground">
              Review your appointment details before confirming.
            </Typography>

            {bookingBlocked ? (
              <div className="space-y-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
                <FormMessage tone="info">
                  {needsAuth
                    ? "Sign in or create an account to confirm this booking. New patients complete informed consent next."
                    : "Informed consent must be completed before you can confirm this booking."}
                </FormMessage>
                {needsAuth ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href={loginHref}>Sign in to continue</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                      <Link href={registerHref}>Create account</Link>
                    </Button>
                  </div>
                ) : (
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={consentHref}>Complete informed consent</Link>
                  </Button>
                )}
              </div>
            ) : (
              <form
                action={confirmAction}
                className="space-y-4"
                onSubmit={(event) => {
                  const honeypot = (
                    event.currentTarget.elements.namedItem("website") as HTMLInputElement
                  )?.value;
                  if (honeypot) {
                    event.preventDefault();
                    return;
                  }
                  if (!holdToken) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="holdToken" value={holdToken ?? ""} />
                <input type="hidden" name="firstName" value={details.firstName} />
                <input type="hidden" name="lastName" value={details.lastName} />
                <input type="hidden" name="email" value={details.email} />
                <input type="hidden" name="phone" value={details.phone} />
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
                />
                {confirmState.error ? (
                  <FormMessage tone="error">{confirmState.error}</FormMessage>
                ) : null}
                {!holdToken ? (
                  <FormMessage tone="error">
                    Your slot hold has expired.{" "}
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-2 hover:underline"
                      onClick={() => setStep(3)}
                    >
                      Choose a new time
                    </button>
                  </FormMessage>
                ) : null}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  loading={confirmPending}
                  disabled={!holdToken}
                >
                  Confirm appointment
                </Button>
              </form>
            )}
          </div>
          <BookingSummaryCard
            items={summaryItems}
            total={selectedService ? formatPrice(selectedService.price_cents) : undefined}
            footer={
              <Typography variant="caption" className="normal-case text-muted-foreground">
                Payment is handled at the practice.{" "}
                <Link href={routes.marketing.pricing} className="text-primary hover:underline">
                  View pricing
                </Link>
              </Typography>
            }
          />
        </section>
      ) : null}

      {step < 5 ? (
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={goBack} disabled={step === 1}>
            Back
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        </div>
      ) : (
        <div className="border-t border-border pt-6">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={goBack}>
            Back to details
          </Button>
        </div>
      )}
    </div>
  );
}
