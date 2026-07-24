import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { Container, Section } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy | Fouza Physiotherapy",
  description:
    "Fouza Physiotherapy's privacy policy, describing how we collect, use, and protect your personal information in line with POPIA.",
  path: routes.marketing.privacy,
});

const lastUpdated = "21 July 2026";

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Typography as="h2" variant="h3">
        {title}
      </Typography>
      <div className="space-y-3 text-body-lg leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        description={`Last updated: ${lastUpdated}`}
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Privacy Policy" },
        ]}
      />

      <Section spacing="md">
        <Container size="md">
          <div className="space-y-10">
            <PolicySection title="1. Introduction">
              <p>
                {siteConfig.practiceName} (&quot;we&quot;, &quot;us&quot;, or
                &quot;the practice&quot;) is committed to protecting your
                privacy and handling your personal information responsibly.
                This Privacy Policy explains how we collect, use, store, and
                protect your personal information in accordance with the
                Protection of Personal Information Act, 2013 (POPIA) and
                other applicable South African law.
              </p>
              <p>
                By using our website, booking an appointment, or engaging
                with our services, you consent to the collection and use of
                your personal information as described in this policy.
              </p>
            </PolicySection>

            <PolicySection title="2. Information we collect">
              <p>We may collect the following categories of personal information:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <strong>Contact information:</strong> name, phone number,
                  email address, and physical address.
                </li>
                <li>
                  <strong>Health information:</strong> medical history,
                  current symptoms, previous treatments, imaging and
                  reports, medications, and clinical notes recorded during
                  your care (special personal information under POPIA,
                  handled with heightened care).
                </li>
                <li>
                  <strong>Booking and payment information:</strong>
                  appointment details, attendance records, and billing
                  information (we do not store full card details).
                </li>
                <li>
                  <strong>Website usage information:</strong> pages visited,
                  device and browser type, and general analytics data
                  collected via cookies or similar technologies.
                </li>
                <li>
                  <strong>Communications:</strong> messages sent via our
                  contact form, email, phone, or WhatsApp.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="3. How we use your information">
              <p>We use your personal information to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Provide safe, appropriate physiotherapy assessment and treatment.</li>
                <li>Schedule, confirm, and manage appointments.</li>
                <li>Generate invoices and professional statements for medical aid claims.</li>
                <li>Communicate with you about your care, including reminders and follow-ups.</li>
                <li>Comply with legal, regulatory, and HPCSA record-keeping obligations.</li>
                <li>Improve our website and services, with your consent where required.</li>
              </ul>
            </PolicySection>

            <PolicySection title="4. Legal basis for processing">
              <p>
                We process your personal information based on your consent,
                the necessity of processing to provide healthcare services
                to you, compliance with legal obligations (including HPCSA
                and health record-keeping requirements), and our legitimate
                interests in operating the practice responsibly.
              </p>
            </PolicySection>

            <PolicySection title="5. Sharing your information">
              <p>
                We do not sell your personal information. We may share
                information with:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  Other healthcare providers involved in your care, with your
                  consent or where clinically necessary (e.g. referring
                  doctors or surgeons).
                </li>
                <li>
                  Medical aid schemes, when you submit statements we provide
                  for reimbursement purposes.
                </li>
                <li>
                  Service providers who support our operations (such as
                  booking, hosting, or email platforms), under appropriate
                  confidentiality obligations.
                </li>
                <li>
                  Regulatory bodies or legal authorities where required by
                  law.
                </li>
              </ul>
            </PolicySection>

            <PolicySection title="6. Data security">
              <p>
                We implement reasonable technical and organisational
                measures to protect your personal information against loss,
                unauthorised access, alteration, or disclosure, consistent
                with the requirements of POPIA. Clinical records are stored
                securely and access is limited to authorised staff involved
                in your care.
              </p>
            </PolicySection>

            <PolicySection title="7. Data retention">
              <p>
                We retain clinical records for the period required by
                HPCSA guidelines and South African law, and other personal
                information for as long as necessary to fulfil the purposes
                described in this policy, or as required by law.
              </p>
            </PolicySection>

            <PolicySection title="8. Your rights">
              <p>Under POPIA, you have the right to:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Request access to the personal information we hold about you.</li>
                <li>Request correction or updating of inaccurate or incomplete information.</li>
                <li>
                  Request deletion of your personal information, subject to
                  our legal and clinical record-keeping obligations.
                </li>
                <li>Object to certain types of processing, such as marketing communications.</li>
                <li>
                  Lodge a complaint with the Information Regulator of South
                  Africa if you believe your rights have been infringed.
                </li>
              </ul>
              <p>
                To exercise any of these rights, please contact us using the
                details below.
              </p>
            </PolicySection>

            <PolicySection title="9. Cookies and website analytics">
              <p>
                Our website may use cookies or similar technologies to
                understand usage patterns and improve your browsing
                experience. You can control cookie preferences through your
                browser settings.
              </p>
            </PolicySection>

            <PolicySection title="10. Children's information">
              <p>
                Where we treat minors, personal information is collected and
                processed with the consent of a parent or legal guardian, in
                accordance with applicable law.
              </p>
            </PolicySection>

            <PolicySection title="11. Changes to this policy">
              <p>
                We may update this Privacy Policy from time to time to
                reflect changes in our practices or legal requirements. The
                &quot;last updated&quot; date at the top of this page
                indicates when it was last revised.
              </p>
            </PolicySection>

            <PolicySection title="12. Contact us">
              <p>
                If you have questions about this Privacy Policy or how we
                handle your personal information, please contact us:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Email: {siteConfig.email}</li>
                <li>Phone: {siteConfig.phoneDisplay}</li>
                <li>Address: {siteConfig.address}</li>
              </ul>
            </PolicySection>
          </div>
        </Container>
      </Section>
    </>
  );
}
