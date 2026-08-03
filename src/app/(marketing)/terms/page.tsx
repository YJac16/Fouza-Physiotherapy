import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { Container, Section } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { pricingNotices } from "@/content/pricing";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions | Fouza Physiotherapy",
  description:
    "Terms and conditions covering booking, cancellations, payment, medical aid, liability, and use of the Fouza Physiotherapy website.",
  path: routes.marketing.terms,
});

const lastUpdated = "21 July 2026";

function TermsSection({
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

export default function TermsPage() {
  return (
    <>
      <PageHero
        title="Terms & Conditions"
        description={`Last updated: ${lastUpdated}`}
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Terms & Conditions" },
        ]}
      />

      <Section spacing="md">
        <Container size="md">
          <div className="space-y-10">
            <TermsSection title="1. Introduction">
              <p>
                These Terms and Conditions govern your use of the{" "}
                {siteConfig.practiceName} website and your engagement with
                our physiotherapy services. By booking an appointment or
                using this website, you agree to these terms. If you do not
                agree, please do not use our services or website.
              </p>
            </TermsSection>

            <TermsSection title="2. Bookings">
              <p>
                Appointments may be requested online or via
                WhatsApp. A booking is only confirmed once you receive
                confirmation from the practice. Online booking is currently
                handled through our external scheduling partner; please
                ensure your contact details are accurate so we can reach you
                if needed.
              </p>
              <p>
                No medical referral is required to book a physiotherapy
                appointment with us.
              </p>
            </TermsSection>

            <TermsSection title="3. Cancellations and non-attendance">
              <p>{pricingNotices.cancellation}</p>
              <p>
                We understand that emergencies happen — please contact us as
                soon as possible if you cannot make your appointment, and we
                will do our best to accommodate rescheduling.
              </p>
            </TermsSection>

            <TermsSection title="4. Payment">
              <p>{pricingNotices.paymentInformation.body}</p>
              <p>{pricingNotices.assessmentOnly}</p>
              <p>{pricingNotices.referralLetter}</p>
              <p>
                Please confirm accepted payment methods when booking.
              </p>
            </TermsSection>

            <TermsSection title="5. Medical aid disclaimer">
              <p>{pricingNotices.medicalAidClaims.body}</p>
            </TermsSection>

            <TermsSection title="6. Informed consent">
              <p>
                Physiotherapy assessment and treatment (including manual
                therapy, exercise prescription, and dry needling where
                applicable) will only be carried out with your informed
                consent. You will be informed of the nature of proposed
                treatment, reasonable alternatives, and any material risks
                before treatment begins, and you may decline or withdraw
                consent to any technique at any time.
              </p>
              <p>
                Please disclose all relevant medical history, medications,
                and health conditions accurately, as this informs safe and
                effective treatment.
              </p>
            </TermsSection>

            <TermsSection title="7. Limitation of liability">
              <p>
                While every reasonable effort is made to provide safe,
                evidence-based, and professional care, physiotherapy —
                like any healthcare intervention — cannot guarantee a
                specific outcome. {siteConfig.practiceName} and its
                practitioners will not be liable for outcomes resulting from
                inaccurate or incomplete information provided by a patient,
                failure to follow professional advice or home exercise
                instructions, or pre-existing conditions not disclosed at
                the time of assessment.
              </p>
              <p>
                Nothing in these terms limits liability that cannot lawfully
                be excluded, including liability arising from gross
                negligence.
              </p>
            </TermsSection>

            <TermsSection title="8. Medical emergencies">
              <p>
                {siteConfig.practiceName} is a physiotherapy practice, not
                an emergency medical service. If you are experiencing a
                medical emergency, please contact your local emergency
                services or go to your nearest emergency room immediately —
                do not wait for a physiotherapy appointment.
              </p>
            </TermsSection>

            <TermsSection title="9. Website use">
              <p>
                Content on this website is provided for general
                informational purposes only and does not constitute medical
                advice or a substitute for individualised clinical
                assessment. You should not rely solely on website content to
                make health decisions — please consult a qualified
                healthcare professional.
              </p>
              <p>
                All content, branding, and design on this website remain the
                property of {siteConfig.practiceName} and may not be
                reproduced without permission.
              </p>
            </TermsSection>

            <TermsSection title="10. Privacy">
              <p>
                Your personal and health information is handled in
                accordance with our{" "}
                <a href={routes.marketing.privacy} className="font-medium text-primary underline-offset-4 hover:underline">
                  Privacy Policy
                </a>
                , which forms part of these terms.
              </p>
            </TermsSection>

            <TermsSection title="11. Changes to these terms">
              <p>
                We may update these Terms and Conditions from time to time.
                Continued use of our services or website after changes take
                effect constitutes acceptance of the revised terms.
              </p>
            </TermsSection>

            <TermsSection title="12. Governing law">
              <p>
                These terms are governed by the laws of the Republic of
                South Africa. Any disputes will be subject to the
                jurisdiction of the South African courts.
              </p>
            </TermsSection>

            <TermsSection title="13. Contact us">
              <p>
                For questions about these Terms and Conditions, please
                contact us at {siteConfig.email} or via WhatsApp.
              </p>
            </TermsSection>
          </div>
        </Container>
      </Section>
    </>
  );
}
