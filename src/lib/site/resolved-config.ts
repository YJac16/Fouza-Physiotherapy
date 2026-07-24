import { getPracticeSetting } from "@/features/practice/api/settings";
import { siteConfig } from "@/config/site";

/**
 * Merge DB practice_settings overrides onto static siteConfig for marketing surfaces.
 */
export async function getResolvedSiteConfig() {
  const [name, email, phone] = await Promise.all([
    getPracticeSetting("practice_name"),
    getPracticeSetting("contact_email"),
    getPracticeSetting("contact_phone"),
  ]);

  return {
    ...siteConfig,
    practiceName:
      typeof name === "string" && name.trim() ? name : siteConfig.practiceName,
    email:
      typeof email === "string" && email.trim() ? email : siteConfig.email,
    phone:
      typeof phone === "string" && phone.trim() ? phone : siteConfig.phone,
  };
}
