"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, MessageCircle, Phone } from "lucide-react";

import {
  BookingProgressIndicator,
  BookingSummaryCard,
  PractitionerCard,
  TimeSlotCard,
  TreatmentCard,
} from "@/components/booking";
import { TrackBookingStarted } from "@/components/analytics/marketing-tracker";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig, telHref } from "@/config/site";
import {
  type BookingActionState,
  confirmBookingAction,
  createHoldAction,
  extendHoldForConsentAction,
  fetchSlotsAction,
  releaseHoldAction,
} from "@/features/booking/actions/booking";
import { PortalFormsClient } from "@/app/(portal)/portal/forms/portal-forms-client";
import { cancellationPolicyNotice } from "@/content/pricing";
import type { BookingPatientContext } from "@/features/booking/lib/eligibility";
import { filterBookableServices } from "@/features/booking/lib/eligibility";
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

export type BookingConsentForms = {
  intakeForm: { id: string; title: string; slug: string };
  treatmentConsent: { id: string; title: string; body_md: string; slug: string };
  accountConsent: { id: string; title: string; body_md: string; slug: string };
};

export interface BookingWizardProps {
  services: BookableService[];
  practitioners: BookablePractitioner[];
  patientContext?: BookingPatientContext | null;
  bookablePatients?: BookingPatientContext[];
  isAuthenticated?: boolean;
  consentForms?: BookingConsentForms | null;
  className?: string;
}

const STEPS = [
  { label: "Service", description: "Choose your treatment" },
  { label: "Practitioner", description: "Select your therapist" },
  { label: "Date & time", description: "Pick a slot" },
  { label: "Details", description: "Your contact info" },
  { label: "Consent", description: "Informed consent" },
  { label: "Review", description: "Confirm booking" },
] as const;

const HOLD_STORAGE_KEY = "fouza-booking-hold";

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

function ContactPracticeFallback({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
      {message ? <p className="text-muted-foreground">{message}</p> : null}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button asChild size="sm" variant="outline">
          <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" aria-hidden />
            WhatsApp us
          </a>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <a href={telHref()}>
            <Phone className="size-4" aria-hidden />
            Call {siteConfig.phoneDisplay}
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
  bookablePatients = [],
  isAuthenticated = false,
  consentForms = null,
  className,
}: BookingWizardProps) {
  const router = useRouter();
  const patients = bookablePatients.length ? bookablePatients : patientContext ? [patientContext] : [];
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.patientId ?? "");
  const selectedPatient =
    patients.find((patient) => patient.patientId === selectedPatientId) ?? patients[0] ?? null;
  const visibleServices = filterBookableServices(
    services.filter((service): service is BookableService & { slug: string } => Boolean(service.slug)),
    Boolean(selectedPatient?.canBookFollowUps),
  );
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
  const [consentComplete, setConsentComplete] = useState(false);
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmBookingAction,
    initialConfirmState,
  );

  const familyConsentMissing = Boolean(
    selectedPatient?.access === "contact" && !selectedPatient.informedConsentSigned,
  );
  const needsConsentStep = Boolean(
    !familyConsentMissing &&
      !consentComplete &&
      (!isAuthenticated || selectedPatient?.needsConsent || !selectedPatient?.informedConsentSigned),
  );
  const consentAlreadyOnFile = Boolean(
    isAuthenticated && selectedPatient && !selectedPatient.needsConsent && selectedPatient.informedConsentSigned,
  );
  const bookingBlocked = familyConsentMissing;

  const minDate = useMemo(() => getDateKeyInTimezone(), []);
  const selectedService = visibleServices.find((s) => s.id === serviceId) ?? null;
  const selectedPractitioner = practitioners.find((p) => p.id === practitionerId) ?? null;

  useEffect(() => {
    if (!selectedPatient) return;
    setDetails({
      firstName: selectedPatient.firstName,
      lastName: selectedPatient.lastName,
      email: selectedPatient.email,
      phone: selectedPatient.phone,
    });
    if (serviceId && !visibleServices.some((service) => service.id === serviceId)) {
      setServiceId(null);
    }
  }, [selectedPatient?.patientId]);

  const holdTokenRef = useRef<string | null>(null);
  holdTokenRef.current = holdToken;

  const loadSlots = useCallback(
    async (nextDate: string) => {
      if (!practitionerId || !serviceId || !nextDate) return;
      setLoadingSlots(true);
      setSlotsError(null);
      setSlots([]);
      setSelectedSlot(null);
      const existingHold = holdTokenRef.current;
      if (existingHold) {
        void releaseHoldAction(existingHold);
        sessionStorage.removeItem(HOLD_STORAGE_KEY);
        setHoldToken(null);
      }

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

  const clearHold = useCallback((token?: string | null) => {
    const toRelease = token ?? holdTokenRef.current;
    if (!toRelease) {
      setHoldToken(null);
      return;
    }
    void releaseHoldAction(toRelease);
    sessionStorage.removeItem(HOLD_STORAGE_KEY);
    setHoldToken(null);
  }, []);

  useEffect(() => {
    if (holdToken) {
      sessionStorage.setItem(HOLD_STORAGE_KEY, holdToken);
    }
  }, [holdToken]);

  useEffect(() => {
    const stored = sessionStorage.getItem(HOLD_STORAGE_KEY);
    if (stored) {
      void releaseHoldAction(stored);
      sessionStorage.removeItem(HOLD_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (consentAlreadyOnFile) {
      setConsentComplete(true);
    }
  }, [consentAlreadyOnFile]);

  useEffect(() => {
    if (confirmState.appointmentId) {
      sessionStorage.removeItem(HOLD_STORAGE_KEY);
      const params = new URLSearchParams();
      if (confirmState.confirmationToken) {
        params.set("token", confirmState.confirmationToken);
      } else if (confirmState.appointmentId) {
        params.set("id", confirmState.appointmentId);
      }
      router.push(`${routes.booking.success}?${params.toString()}`);
    }
  }, [confirmState.appointmentId, confirmState.confirmationToken, router]);

  async function handleSlotSelect(slot: { startsAt: string; endsAt: string; label: string }) {
    if (!practitionerId || !serviceId) return;
    if (holdToken && selectedSlot?.startsAt !== slot.startsAt) {
      clearHold();
    }
    setSelectedSlot(slot);
    setHoldError(null);
  }

  async function holdSelectedSlot() {
    if (!practitionerId || !serviceId || !selectedSlot) {
      setHoldError("Choose a time first.");
      return null;
    }
    setHoldError(null);
    setHoldingSlot(true);
    const result = await createHoldAction({
      practitionerId,
      serviceId,
      startsAt: selectedSlot.startsAt,
      endsAt: selectedSlot.endsAt,
      email: details.email || undefined,
    });
    setHoldingSlot(false);
    if (result.error || !result.holdToken) {
      setHoldError(result.error ?? "Unable to reserve this slot. Please pick another time.");
      setHoldToken(null);
      return null;
    }
    setHoldToken(result.holdToken);
    return result.holdToken;
  }

  function canContinue() {
    switch (step) {
      case 1:
        return Boolean(serviceId);
      case 2:
        return Boolean(practitionerId);
      case 3:
        return Boolean(date && selectedSlot && !holdingSlot);
      case 4:
        return (
          details.firstName.trim().length > 0 &&
          details.lastName.trim().length > 0 &&
          details.email.includes("@") &&
          details.phone.trim().length >= 7 &&
          !holdingSlot
        );
      case 5:
        return consentComplete || consentAlreadyOnFile;
      default:
        return true;
    }
  }

  async function goNext() {
    if (!canContinue()) return;
    if (step === 4) {
      const token = holdToken || (await holdSelectedSlot());
      if (!token) return;
      if (needsConsentStep) {
        void extendHoldForConsentAction(token);
        setStep(5);
        return;
      }
      setStep(6);
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length));
  }

  function goBack() {
    if (step === 6) {
      setStep(needsConsentStep || consentComplete ? 5 : 4);
      return;
    }
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
          { label: "Patient", value: `${details.firstName} ${details.lastName}`.trim() },
          { label: "Email", value: details.email },
          { label: "Phone", value: details.phone },
        ]
      : [];

  return (
    <div className={cn("min-w-0 space-y-8", className)}>
      <TrackBookingStarted />
      <BookingProgressIndicator steps={[...STEPS]} currentStep={step} />

      {!selectedPatient?.canBookFollowUps ? (
        <FormMessage tone="info">
          {selectedPatient?.access === "contact"
            ? "Follow-up bookings for this patient unlock once the practice has verified informed consent on file."
            : "New patients can book an Initial Consultation or Injury Prevention Assessment. Follow-up appointments unlock after verified account status and informed consent."}
        </FormMessage>
      ) : null}

      {patients.length > 1 ? (
        <div className="space-y-2">
          <Label htmlFor="booking-patient">Who is this appointment for?</Label>
          <select
            id="booking-patient"
            className="h-11 w-full max-w-lg rounded-xl border border-border bg-background px-3 text-sm"
            value={selectedPatientId}
            onChange={(event) => setSelectedPatientId(event.target.value)}
          >
            {patients.map((patient) => (
              <option key={patient.patientId} value={patient.patientId}>
                {patient.firstName} {patient.lastName}
                {patient.access === "contact" ? " (family)" : ""}
              </option>
            ))}
          </select>
        </div>
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
            {visibleServices.map((service) => (
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
                  <ContactPracticeFallback message="Try another date, or contact the practice to schedule." />
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
                        onClick={() => void handleSlotSelect(slot)}
                      />
                    ))}
                  </div>
                  {holdError ? (
                    <div className="mt-4 space-y-3">
                      <FormMessage tone="error">{holdError}</FormMessage>
                      <ContactPracticeFallback message="This slot could not be reserved. Try another time, or contact the practice." />
                    </div>
                  ) : null}
                  {selectedSlot ? (
                    <FormMessage tone="info" className="mt-4">
                      {selectedSlot.label} on {formatBookingDate(selectedSlot.startsAt)} selected.
                      We only reserve the time after you enter your details.
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
            {selectedPatient
              ? selectedPatient.access === "contact"
                ? "We’ll book this visit against the selected patient’s record."
                : "We’ve filled these from your profile — edit if anything needs updating."
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
          {holdingSlot ? (
            <FormMessage tone="loading" className="mt-4">
              Reserving your time for 10 minutes…
            </FormMessage>
          ) : null}
          {holdError ? <FormMessage tone="error" className="mt-4">{holdError}</FormMessage> : null}
          {holdToken && selectedSlot ? (
            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <FormMessage tone="success" className="m-0">
                {selectedSlot.label} on {formatBookingDate(selectedSlot.startsAt)} is held for 10
                minutes.
              </FormMessage>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  clearHold();
                  setStep(3);
                }}
              >
                Release this time
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Continue to reserve this time for 10 minutes while you complete consent.
            </p>
          )}
        </section>
      ) : null}

      {step === 5 ? (
        <section aria-labelledby="booking-step-consent">
          <Typography as="h2" id="booking-step-consent" variant="h3" className="mb-2">
            Informed consent
          </Typography>
          <Typography variant="small" className="mb-6 text-muted-foreground">
            {consentAlreadyOnFile
              ? "Your informed consent is already on file."
              : "Please read and complete the required consent forms before confirming your appointment."}
          </Typography>
          {holdToken && selectedSlot ? (
            <div className="mb-6 flex flex-col gap-2 rounded-xl border border-border bg-secondary/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedSlot.label} is held for 10 minutes while you complete consent.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  clearHold();
                  setStep(3);
                }}
              >
                Release this time
              </Button>
            </div>
          ) : null}

          {consentAlreadyOnFile || consentComplete ? (
            <div className="space-y-4 rounded-xl border border-success/30 bg-success/5 p-4">
              <FormMessage tone="success">Consent already completed</FormMessage>
              <Typography variant="small" className="text-muted-foreground">
                You accepted the current terms and conditions. You can review the cancellation policy
                below before continuing.
              </Typography>
              <p className="text-sm leading-relaxed text-muted-foreground">{cancellationPolicyNotice}</p>
              <Button type="button" onClick={() => setStep(6)}>
                Continue to review
              </Button>
            </div>
          ) : consentForms ? (
            <PortalFormsClient
              mode={isAuthenticated && selectedPatient?.patientId ? "portal" : "guest"}
              patientId={selectedPatient?.patientId}
              holdToken={holdToken ?? undefined}
              guestDetails={details}
              intakeForm={consentForms.intakeForm}
              treatmentConsent={consentForms.treatmentConsent}
              accountConsent={consentForms.accountConsent}
              defaults={{
                fullName: `${details.firstName} ${details.lastName}`.trim(),
                email: details.email,
                phone: details.phone,
              }}
              onConsentComplete={() => {
                setConsentComplete(true);
                setStep(6);
              }}
            />
          ) : (
            <FormMessage tone="error">
              Consent forms are unavailable. Please contact the practice to complete your booking.
            </FormMessage>
          )}
        </section>
      ) : null}

      {step === 6 ? (
        <section aria-labelledby="booking-step-confirm" className="grid gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <Typography as="h2" id="booking-step-confirm" variant="h3" className="mb-2">
              Review &amp; confirm
            </Typography>
            <Typography variant="small" className="mb-6 text-muted-foreground">
              Review your appointment details before confirming.
            </Typography>

            {bookingBlocked ? (
              <div className="space-y-4 rounded-xl border border-warning/30 bg-warning/5 p-4">
                <FormMessage tone="info">
                  Informed consent for this patient must be captured by the practice before you can
                  book online.
                </FormMessage>
                <p className="text-sm text-muted-foreground">
                  Ask the practice to complete consent at the visit, then follow-ups can be booked
                  here.
                </p>
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
                  if (!holdToken || (!consentComplete && !consentAlreadyOnFile)) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="holdToken" value={holdToken ?? ""} />
                <input type="hidden" name="patientId" value={selectedPatient?.patientId ?? ""} />
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

                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
                  <p className="font-medium text-foreground">Consent</p>
                  <p className="mt-1 text-muted-foreground">
                    {consentComplete || consentAlreadyOnFile
                      ? "Completed"
                      : "Please complete consent before confirming."}
                  </p>
                  <p className="mt-3 font-medium text-foreground">Payment</p>
                  <p className="mt-1 text-muted-foreground">
                    Payment is handled at the practice after your visit (cash, card, or EFT).
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {cancellationPolicyNotice}
                  </p>
                </div>

                {confirmState.error ? (
                  <FormMessage tone="error">{confirmState.error}</FormMessage>
                ) : null}
                {!holdToken ? (
                  <FormMessage tone="error">
                    Your slot is not reserved.{" "}
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-2 hover:underline"
                      onClick={() => setStep(3)}
                    >
                      Choose a time
                    </button>
                  </FormMessage>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <FormMessage tone="success">
                      Time held — confirm below, or release if you need a different slot.
                    </FormMessage>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clearHold();
                        setStep(3);
                      }}
                    >
                      Release this time
                    </Button>
                  </div>
                )}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  loading={confirmPending}
                  disabled={!holdToken || (!consentComplete && !consentAlreadyOnFile)}
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

      {step < 6 ? (
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={goBack} disabled={step === 1}>
            Back
          </Button>
          {step !== 5 ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => void goNext()}
              loading={step === 4 && holdingSlot}
              disabled={!canContinue()}
            >
              {step === 4 ? "Reserve time and continue" : "Continue"}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="border-t border-border pt-6">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={goBack}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
