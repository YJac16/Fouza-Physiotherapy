-- Expand treatment consent with post-treatment expectations and acknowledgment

update public.consent_forms
set
  body_md = E'# Consent to Physiotherapy Treatment

## Before and during treatment

Your comfort and safety are important to me. Before treatment, I will explain the techniques I recommend, what you can expect during your session, and any common or potential side effects. Please feel free to ask questions at any stage—your understanding and participation are an important part of your recovery.

1. During assessment and treatment, I may be required to expose specific body parts related to my condition or injury. I understand that I may refuse when I feel uncomfortable.
2. During assessment/treatment, the physiotherapist may be required to touch me in order to provide effective treatment and I should inform them if I am uncomfortable in them doing so.
3. I have the right to withdraw this consent at any time or for a specific treatment procedure.
4. I understand that the physiotherapist will explain the benefits and risks of a specific procedure or modality, and will inform me of any alternative.
5. I understand that there are small possibilities of risks or side-effects to the treatment and this would be discussed with the physiotherapist. I also understand and trust that the physiotherapist would take all necessary precautions to avoid these risks.
6. I understand that I am able to ask the physiotherapist any questions during or after the physiotherapy session.
7. I give consent for Fouza Physiotherapy to disclose information regarding my diagnosis (ICD10 Coding), medical condition, prognosis and treatment program for account rendering purposes and appropriate referral. Any other information released will be discussed with the signatory according to the POPI Act (Act number 4 of 2013).

## After your treatment

Following physiotherapy treatment, it is normal for some people to experience temporary soreness, tenderness, stiffness, bruising (where appropriate), mild swelling, fatigue, or a short-term increase in symptoms. These responses are usually temporary and often settle within 24–72 hours as your body adapts to treatment.

Every treatment is tailored to your individual needs, and every reasonable precaution is taken to provide safe, evidence-based care. However, as with all healthcare treatments, no procedure is entirely without risk, and individual responses can vary.

If you experience symptoms that are severe, unusual, rapidly worsening, or cause you concern, please seek prompt assessment from your general practitioner, the nearest emergency department, or another appropriate healthcare provider. Fouza Physiotherapy operates by appointment only and is not an emergency medical service.

If you have any non-urgent questions or concerns following your treatment, you are welcome to contact the practice, and I will do my best to assist you as soon as reasonably possible during business hours.

## Acknowledgment

By signing below, I acknowledge that the proposed treatment, expected benefits, possible risks, and common post-treatment responses have been explained to me. I have had the opportunity to ask questions, and I consent to receive physiotherapy treatment.

I hereby willingly consent to the treatment offered and recommended to me by my physiotherapist(s). I therefore intend to verbally consent to future physiotherapy sessions.',
  version = public.consent_forms.version + 1
where slug = 'treatment-consent'
  and is_active = true;
