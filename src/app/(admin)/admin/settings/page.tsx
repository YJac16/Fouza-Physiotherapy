import { PracticeSettingsForm } from "@/features/practice/components/settings-form";
import { getPracticeSetting } from "@/features/practice/api/settings";

export default async function AdminSettingsPage() {
  const [practiceName, contactEmail, contactPhone] = await Promise.all([
    getPracticeSetting("practice_name"),
    getPracticeSetting("contact_email"),
    getPracticeSetting("contact_phone"),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Practice-wide configuration for branding and contact details.
        </p>
      </div>

      <PracticeSettingsForm
        defaults={{
          practiceName: typeof practiceName === "string" ? practiceName : "",
          contactEmail: typeof contactEmail === "string" ? contactEmail : "",
          contactPhone: typeof contactPhone === "string" ? contactPhone : "",
        }}
      />
    </div>
  );
}
