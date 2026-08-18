import { PatientProfileCard } from "@/components/patient/cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortalView } from "@/features/patients/api/patients";
import { patientDisplayName } from "@/features/patients/lib/access";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function PortalProfilePage() {
  const profile = await requireUser();
  const { selected } = await getPortalView();
  const supabase = await createClient();
  const { data: patient } = selected
    ? await supabase.from("patients").select("*").eq("id", selected.id).maybeSingle()
    : { data: null };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account and patient details.</p>
      </div>

      <PatientProfileCard
        name={profile.full_name ?? profile.email}
        email={profile.email}
        phone={profile.phone ?? undefined}
        memberSince={new Date(profile.created_at).toLocaleDateString("en-ZA")}
      />

      {patient ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-h5">
              {selected?.access === "contact" ? "Family patient" : "Patient record"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Legal name</span>
              <p className="font-medium">{patientDisplayName({
                firstName: patient.first_name,
                lastName: patient.last_name,
              })}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date of birth</span>
              <p className="font-medium">
                {patient.date_of_birth
                  ? new Date(patient.date_of_birth).toLocaleDateString("en-ZA")
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Medical aid</span>
              <p className="font-medium">{patient.medical_aid_name ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Medical aid number</span>
              <p className="font-medium">{patient.medical_aid_number ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Account holder</span>
              <p className="font-medium">{patient.billing_name ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Invoice email</span>
              <p className="font-medium">{patient.billing_email ?? patient.email ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
