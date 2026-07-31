import {
  Activity,
  Armchair,
  Baby,
  Bone,
  Dumbbell,
  Hand,
  HeartPulse,
  Home,
  Syringe,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export type ServiceContent = {
  slug: string;
  name: string;
  shortDescription: string;
  overview: string;
  whoItHelps: string[];
  benefits: string[];
  process: string[];
  duration: string;
  faqs: { question: string; answer: string }[];
  icon: LucideIcon;
  image: string;
};

export const services: ServiceContent[] = [
  {
    slug: "sports-physiotherapy",
    name: "Sports Physiotherapy",
    shortDescription:
      "Injury assessment, rehab, and return-to-play programmes for active people and athletes.",
    overview:
      "Sports physiotherapy focuses on preventing, diagnosing, and rehabilitating activity-related injuries so you can return to movement with confidence. Treatment combines hands-on care, load management, and progressive exercise.",
    whoItHelps: [
      "Recreational and competitive athletes",
      "People returning after sports injuries",
      "Anyone with overuse or training-load related pain",
    ],
    benefits: [
      "Faster, safer return to sport",
      "Improved strength and movement quality",
      "Reduced risk of re-injury",
    ],
    process: [
      "Detailed injury and training history",
      "Movement and load assessment",
      "Hands-on treatment and education",
      "Progressive rehab and return-to-play plan",
    ],
    duration: "45–60 minutes",
    faqs: [
      {
        question: "Do I need a referral for sports physiotherapy?",
        answer:
          "No referral is required. You can book directly for an assessment.",
      },
      {
        question: "Can I continue training while rehabbing?",
        answer:
          "Often yes — we guide modified loading so recovery and fitness can progress together safely.",
      },
    ],
    icon: Dumbbell,
    image: siteConfig.images.sports,
  },
  {
    slug: "womens-health",
    name: "Women's Health",
    shortDescription:
      "Supportive physiotherapy for pregnancy-related pain and women’s musculoskeletal needs.",
    overview:
      "Women’s health physiotherapy addresses pregnancy-related discomfort, postnatal recovery considerations, and related musculoskeletal concerns with respectful, individualised care.",
    whoItHelps: [
      "Expectant mothers with back, pelvic, or joint pain",
      "Women navigating postnatal musculoskeletal recovery",
      "Patients seeking gentle, personalised rehab",
    ],
    benefits: [
      "Reduced pregnancy-related discomfort",
      "Better movement confidence",
      "Education for daily activities and recovery",
    ],
    process: [
      "Confidential consultation",
      "Tailored assessment",
      "Comfort-focused treatment",
      "Home strategies and exercise guidance",
    ],
    duration: "45–60 minutes",
    faqs: [
      {
        question: "Is physiotherapy safe during pregnancy?",
        answer:
          "Yes, when tailored appropriately. We adapt techniques and positions for each trimester and comfort level.",
      },
    ],
    icon: Baby,
    image: siteConfig.images.posture,
  },
  {
    slug: "dry-needling",
    name: "Dry Needling",
    shortDescription:
      "Targeted needling to ease muscle tension and support pain relief as part of a broader plan.",
    overview:
      "Dry needling uses fine filament needles to address myofascial trigger points and muscle tension. It is used alongside manual therapy and exercise — never as a standalone cure-all.",
    whoItHelps: [
      "People with tight, irritable muscles",
      "Patients with referred myofascial pain",
      "Those seeking adjunct pain relief during rehab",
    ],
    benefits: [
      "Reduced muscle guarding",
      "Improved local mobility",
      "Supports active rehabilitation",
    ],
    process: [
      "Assessment of suitability and consent",
      "Explanation of sensations and aftercare",
      "Needling of selected points",
      "Follow-up mobility and exercise advice",
    ],
    duration: "Included within consultation time",
    faqs: [
      {
        question: "Does dry needling hurt?",
        answer:
          "You may feel a brief ache or twitch. Most people tolerate it well, and we always work within your comfort.",
      },
      {
        question: "Is dry needling the same as acupuncture?",
        answer:
          "No. Dry needling is based on Western musculoskeletal assessment, not traditional acupuncture meridians.",
      },
    ],
    icon: Syringe,
    image: siteConfig.images.softTissue,
  },
  {
    slug: "manual-therapy",
    name: "Manual Therapy",
    shortDescription:
      "Skilled hands-on techniques to improve mobility, ease pain, and restore comfortable movement.",
    overview:
      "Manual therapy includes joint mobilisation, soft tissue techniques, and guided movement. It is combined with education and exercise for lasting change.",
    whoItHelps: [
      "People with joint stiffness or spinal pain",
      "Patients with soft tissue restriction",
      "Anyone needing skilled hands-on care",
    ],
    benefits: [
      "Improved range of motion",
      "Short-term pain relief",
      "Better movement quality for exercise",
    ],
    process: [
      "Identify movement restrictions",
      "Apply appropriate manual techniques",
      "Reassess response",
      "Prescribe supporting exercises",
    ],
    duration: "45–60 minutes",
    faqs: [
      {
        question: "Will I only receive massage?",
        answer:
          "No. Manual therapy is clinical and goal-directed, and is paired with active rehab for durable results.",
      },
    ],
    icon: Hand,
    image: siteConfig.images.manualTherapy,
  },
  {
    slug: "post-surgery-rehabilitation",
    name: "Post Surgery Rehabilitation",
    shortDescription:
      "Structured recovery after orthopaedic and soft-tissue surgery to restore strength and function.",
    overview:
      "Post-operative physiotherapy guides safe progression from early protection through strength, mobility, and return to daily life or sport.",
    whoItHelps: [
      "Patients after orthopaedic procedures",
      "People recovering from soft-tissue repairs",
      "Anyone needing a clear rehab roadmap",
    ],
    benefits: [
      "Safe staged recovery",
      "Reduced stiffness and weakness",
      "Clear milestones and education",
    ],
    process: [
      "Review of surgical protocol and goals",
      "Early mobility and swelling management",
      "Progressive strengthening",
      "Functional return planning",
    ],
    duration: "45–60 minutes",
    faqs: [
      {
        question: "When should I start physiotherapy after surgery?",
        answer:
          "Timing depends on your surgeon’s protocol. Contact us with your operation details and we will advise.",
      },
    ],
    icon: Bone,
    image: siteConfig.images.postOp,
  },
  {
    slug: "back-pain",
    name: "Back Pain Treatment",
    shortDescription:
      "Assessment and rehab for acute and persistent lower and mid-back pain.",
    overview:
      "Back pain care focuses on understanding your symptoms, restoring confident movement, and building resilience through education and exercise.",
    whoItHelps: [
      "People with acute or recurring back pain",
      "Desk workers with postural strain",
      "Patients with stiffness after injury",
    ],
    benefits: [
      "Clear understanding of your pain",
      "Practical strategies for daily life",
      "Stronger, more resilient movement",
    ],
    process: [
      "Thorough history and screening",
      "Movement assessment",
      "Hands-on care where indicated",
      "Individualised exercise plan",
    ],
    duration: "45–60 minutes",
    faqs: [
      {
        question: "Do I need a scan before treatment?",
        answer:
          "Not usually. Imaging is considered when clinically indicated or advised by your doctor.",
      },
    ],
    icon: Activity,
    image: siteConfig.images.backRehab,
  },
  {
    slug: "neck-pain",
    name: "Neck Pain Treatment",
    shortDescription:
      "Relief and rehab for neck stiffness, tension, and movement-related discomfort.",
    overview:
      "Neck pain treatment addresses joint mobility, muscle tension, posture, and load — helping you move with less irritability and more control.",
    whoItHelps: [
      "People with desk-related neck tension",
      "Patients with stiffness after sleep or travel",
      "Those with associated headaches",
    ],
    benefits: [
      "Reduced stiffness and guarding",
      "Improved posture awareness",
      "Better sleep and work comfort",
    ],
    process: [
      "Assessment of neck and related regions",
      "Manual therapy and soft tissue care",
      "Ergonomic and movement advice",
      "Targeted strengthening",
    ],
    duration: "45–60 minutes",
    faqs: [
      {
        question: "Can neck pain cause headaches?",
        answer:
          "Yes. Cervicogenic contributions are common; we assess whether your neck is involved and treat accordingly.",
      },
    ],
    icon: PersonStanding,
    image: siteConfig.images.posture,
  },
  {
    slug: "shoulder-rehabilitation",
    name: "Shoulder Rehabilitation",
    shortDescription:
      "Restore mobility and strength after shoulder pain, injury, or stiffness.",
    overview:
      "Shoulder rehab blends mobility work, scapular control, and progressive loading so you can reach, lift, and sleep more comfortably.",
    whoItHelps: [
      "People with rotator cuff related pain",
      "Patients with frozen shoulder patterns",
      "Anyone recovering after shoulder injury",
    ],
    benefits: [
      "Improved range and strength",
      "Better sleep positions",
      "Confident return to lifting and sport",
    ],
    process: [
      "Shoulder and kinetic chain assessment",
      "Pain-settling strategies",
      "Progressive mobility and strength",
      "Functional goal planning",
    ],
    duration: "45–60 minutes",
    faqs: [
      {
        question: "Should I rest my shoulder completely?",
        answer:
          "Complete rest is rarely ideal. Guided, graded activity usually supports better recovery.",
      },
    ],
    icon: Armchair,
    image: siteConfig.images.shoulderRehab,
  },
  {
    slug: "home-visits",
    name: "Home Visits",
    shortDescription:
      "Physiotherapy in the comfort of your home when travel to the clinic is difficult.",
    overview:
      "Home visits bring assessment and treatment to you — helpful after surgery, during limited mobility, or when clinic attendance is impractical.",
    whoItHelps: [
      "Patients with limited mobility",
      "Post-operative recovery at home",
      "Those preferring treatment in their own space",
    ],
    benefits: [
      "Care without travel strain",
      "Functional rehab in your environment",
      "Family/caregiver education where helpful",
    ],
    process: [
      "Confirm suitability and area coverage",
      "Home assessment",
      "Treatment and home exercise setup",
      "Follow-up planning",
    ],
    duration: "By arrangement",
    faqs: [
      {
        question: "Which areas do you cover?",
        answer:
          "Please contact the practice to confirm availability for your suburb and preferred times.",
      },
    ],
    icon: Home,
    image: siteConfig.images.assessment,
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function serviceHref(slug: string) {
  return routes.marketing.service(slug);
}

export const trustItems = [
  {
    title: "HPCSA Registered",
    description: siteConfig.founder.registration,
    icon: HeartPulse,
  },
  {
    title: "Practice Details",
    description: siteConfig.founder.practiceNumber
      ? `Practice no. ${siteConfig.founder.practiceNumber}`
      : "Private physiotherapy practice · Cape Town",
    icon: Bone,
  },
  {
    title: "Years of Experience",
    description: "Clinical practice since 2019 · Own practice since 2021",
    icon: Activity,
  },
  {
    title: "Evidence-Based Care",
    description: "Techniques guided by current physiotherapy research",
    icon: Hand,
  },
  {
    title: "Personalised Treatment",
    description: "Plans tailored to your goals, lifestyle, and values",
    icon: PersonStanding,
  },
  {
    title: "Modern Rehabilitation",
    description: "Hands-on care plus progressive exercise programmes",
    icon: Dumbbell,
  },
] as const;
