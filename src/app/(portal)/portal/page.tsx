import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { EmptyState } from "@/components/shared/states";
import {
  AppointmentHistoryCard,
  DocumentCard,
  InvoiceCard,
} from "@/components/patient/cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listPatientInvoices } from "@/features/billing/actions/billing";
import { getPatientConsentCompletion } from "@/features/consent-forms/lib/completion";
import { listPatientDocuments } from "@/features/documents/actions/documents";
import { listPatientProgrammes } from "@/features/exercise-programmes/actions/programmes";
import { getMyPatientRecord, listMyAppointments } from "@/features/patients/api/patients";
import { requireUser } from "@/lib/auth/guards";
import { routes } from "@/config/routes";

function invoiceCardStatus(status: string): "paid" | "pending" | "overdue" {
  if (status === "paid") return "paid";
  if (status === "overdue") return "overdue";
  return "pending";
}

export default async function PortalHomePage() {
  const profile = await requireUser();
  const { data: patient } = await getMyPatientRecord();

  const [appointmentsResult, programmesResult, invoicesResult, documentsResult] = patient
    ? await Promise.all([
        listMyAppointments(true),
        listPatientProgrammes(),
        listPatientInvoices(),
        listPatientDocuments(),
      ])
    : [null, null, null, null];

  const greeting = profile.full_name?.split(" ")[0] ?? "there";
  const completion = patient
    ? await getPatientConsentCompletion(patient.id)
    : null;

  const upcomingAppointments = (appointmentsResult?.data ?? []).slice(0, 4);
  const recentProgrammes = (programmesResult?.data ?? []).slice(0, 3);
  const recentInvoices = (invoicesResult?.data ?? [])
    .filter((invoice) => ["sent", "paid", "overdue"].includes(invoice.status))
    .slice(0, 3);
  const recentDocuments = (documentsResult?.data ?? []).slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome, {greeting}</h1>
        <p className="text-sm text-muted-foreground">
          Your Fouza Physiotherapy patient portal.
        </p>
      </div>

      {patient && completion && !completion.complete ? (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
          <p className="font-display text-lg font-semibold text-foreground">
            Complete your forms before your visit
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Informed consent is still outstanding
            {completion.missing.length
              ? `: ${completion.missing.join(", ")}`
              : "."}
          </p>
          <Button asChild className="mt-4">
            <Link href={routes.portal.forms}>Open informed consent</Link>
          </Button>
        </div>
      ) : null}

      {!patient ? (
        <EmptyState
          title="No patient record linked"
          description="Contact the practice to link your account to a patient record."
        />
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Upcoming appointments</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.portal.appointments}>View all</Link>
              </Button>
            </div>

            {!upcomingAppointments.length ? (
              <EmptyState
                title="No upcoming appointments"
                description="Book online or call the practice to schedule your next visit."
                action={
                  <Button asChild>
                    <Link href={routes.booking.root}>Book appointment</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingAppointments.map((appt) => {
                  const service = (Array.isArray(appt.services)
                    ? appt.services[0]
                    : appt.services) as { name: string } | null | undefined;
                  return (
                    <AppointmentHistoryCard
                      key={appt.id}
                      title={service?.name ?? "Appointment"}
                      date={new Date(appt.starts_at).toLocaleString("en-ZA", {
                        timeZone: "Africa/Johannesburg",
                      })}
                      practitioner="Fouza Physiotherapy"
                      outcome={appt.status}
                    />
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Programmes</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.portal.programmes}>View all</Link>
              </Button>
            </div>

            {!recentProgrammes.length ? (
              <EmptyState
                title="No programmes assigned"
                description="Your practitioner will assign exercises after your consultation."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentProgrammes.map((programme) => {
                  const exercises =
                    (programme.programme_exercises as { id: string }[] | null) ?? [];
                  return (
                    <Link
                      key={programme.id}
                      href={routes.portal.programmes}
                      className="block"
                    >
                      <Card className="h-full shadow-sm transition-colors hover:bg-muted/40">
                        <CardHeader className="flex-row items-start gap-3 space-y-0 pb-3">
                          <div
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                            aria-hidden
                          >
                            <Dumbbell className="size-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="truncate text-h5 leading-snug">
                              {programme.title}
                            </CardTitle>
                            <CardDescription>
                              {exercises.length} exercise
                              {exercises.length === 1 ? "" : "s"}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        {programme.description ? (
                          <CardContent className="pt-0">
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {programme.description}
                            </p>
                          </CardContent>
                        ) : null}
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Invoices</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.portal.invoices}>View all</Link>
              </Button>
            </div>

            {!recentInvoices.length ? (
              <EmptyState
                title="No invoices yet"
                description="Invoices will appear here after your consultations."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={routes.portal.invoice(invoice.id)}
                    className="block"
                  >
                    <InvoiceCard
                      invoiceNumber={invoice.invoice_number}
                      date={invoice.issue_date}
                      amount={`R ${(invoice.total_cents / 100).toFixed(2)}`}
                      status={invoiceCardStatus(invoice.status)}
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Documents</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={routes.portal.documents}>View all</Link>
              </Button>
            </div>

            {!recentDocuments.length ? (
              <EmptyState
                title="No documents shared"
                description="Documents made visible to you will appear here."
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={routes.portal.documents}
                    className="block"
                  >
                    <DocumentCard
                      title={doc.title}
                      type={doc.doc_type}
                      date={new Date(doc.created_at).toLocaleDateString("en-ZA")}
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
