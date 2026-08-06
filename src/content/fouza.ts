import {
  GraduationCap,
  Hand,
  HeartHandshake,
  Syringe,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { siteConfig } from "@/config/site";

export type FouzaTimelineEntry = {
  year: string;
  title: string;
  description: string;
};

export type FouzaQualification = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type FouzaSpecialInterest = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const fouzaBio = {
  name: siteConfig.founder.name,
  title: siteConfig.founder.title,
  credentials: siteConfig.founder.credentials,
  registration: siteConfig.founder.registration,

  intro:
    "Fouza Abrahams is a HPCSA-registered physiotherapist and the founder of Fouza Physiotherapy in Walmer Estate, Cape Town. With a special interest in the assessment and management of persistent pain, she combines thorough, evidence-based care with warmth — helping people make sense of their pain, restore confidence in movement, and return to the activities that matter most.",

  story: [
    "Fouza's path into physiotherapy was shaped by a genuine curiosity about how the body moves, heals, and adapts — and a deep motivation to help people return to the activities and roles that matter most to them, whether that's playing sport, picking up a child, returning to work, or simply walking without fear.",
    "She completed her BSc in Physiotherapy at the University of Cape Town (UCT) in 2018, graduating with a strong foundation in musculoskeletal, neurological, and cardiorespiratory rehabilitation. In 2019, she completed her compulsory community service year, working across busy public healthcare settings where she treated a wide range of conditions and built the clinical resilience that still shapes her practice today.",
    "That experience — treating high patient volumes with limited resources — taught Fouza to prioritise what matters clinically: a clear diagnosis, an honest conversation, and a treatment plan the patient can actually follow. In 2021, she opened her own private practice in Walmer Estate to offer exactly that kind of care, on her own terms, with the time and attention each patient deserves.",
    "Since then, Fouza has built a practice around evidence-based rehabilitation, hands-on treatment, and long-term relationships with her patients — many of whom return for new concerns years after their first visit, because they trust the process and the person guiding it.",
  ],

  philosophy: [
    {
      title: "Assess before you treat",
      description:
        "Every plan starts with a thorough, honest assessment. Fouza explains what she finds in plain language before any treatment begins.",
    },
    {
      title: "Movement is medicine",
      description:
        "Where appropriate, guided movement and graded loading are prioritised over prolonged rest — because tissues, joints, and confidence recover through use, not avoidance.",
    },
    {
      title: "Hands-on, evidence-led",
      description:
        "Manual therapy and dry needling are used purposefully, as part of a broader plan — never as a substitute for active rehabilitation.",
    },
    {
      title: "Care that fits your life",
      description:
        "Home programmes are built around your schedule, equipment, and goals, so recovery keeps progressing between sessions.",
    },
  ],

  qualifications: [
    {
      title: "BSc Physiotherapy — University of Cape Town",
      description: "Graduated 2018 from one of South Africa's leading physiotherapy programmes.",
      icon: GraduationCap,
    },
    {
      title: "HPCSA Registered Physiotherapist",
      description: "Registered with the Health Professions Council of South Africa.",
      icon: ShieldCheck,
    },
    {
      title: "Community Service, 2019",
      description: "Compulsory service year treating a broad caseload in public healthcare settings.",
      icon: Stethoscope,
    },
    {
      title: "Private Practice since 2021",
      description: "Founded Fouza Physiotherapy to deliver personalised, evidence-based care.",
      icon: HeartHandshake,
    },
  ] satisfies FouzaQualification[],

  timeline: [
    {
      year: "2018",
      title: "Graduated UCT",
      description: "Completed BSc Physiotherapy at the University of Cape Town.",
    },
    {
      year: "2019",
      title: "Community service",
      description: "Treated a wide range of conditions across busy public healthcare settings.",
    },
    {
      year: "2021",
      title: "Opened private practice",
      description: "Founded Fouza Physiotherapy in Walmer Estate, Cape Town.",
    },
    {
      year: "Today",
      title: "Growing patient community",
      description: "Continuing to build long-term relationships through personalised rehabilitation.",
    },
  ] satisfies FouzaTimelineEntry[],

  specialInterests: [
    {
      title: "Persistent Pain",
      description:
        "Assessment and management of persistent pain — helping people make sense of their pain, restore confidence in movement, and return to the activities that matter most.",
      icon: HeartHandshake,
    },
    {
      title: "Dry Needling",
      description: "Targeted needling for muscle tension as part of a broader treatment plan.",
      icon: Syringe,
    },
    {
      title: "Manual Therapy",
      description: "Skilled hands-on treatment to restore mobility and ease pain.",
      icon: Hand,
    },
  ] satisfies FouzaSpecialInterest[],

  images: {
    portrait: siteConfig.images.portrait,
    clinic: siteConfig.images.clinic,
    treatment: siteConfig.images.treatment,
    hero: siteConfig.images.hero,
  },
};
