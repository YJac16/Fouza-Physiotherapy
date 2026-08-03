export type PricingPlan = {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "initial",
    title: "Initial Consultation",
    price: "R700",
    period: "60 min",
    description: "Comprehensive assessment, treatment, and personalised plan.",
    features: [
      "Detailed history and examination",
      "Hands-on treatment where indicated",
      "Clear explanation of findings",
      "Home advice and exercise start",
    ],
    highlighted: true,
    badge: "Most booked",
  },
  {
    id: "follow-up",
    title: "Follow-up Consultation",
    price: "R600",
    period: "45–60 min",
    description: "Focused treatment for a single joint or region.",
    features: [
      "Progress review",
      "Continued hands-on care",
      "Exercise progression",
      "One primary focus area",
    ],
  },
  {
    id: "double-follow-up",
    title: "Double Follow-up",
    price: "R800",
    period: "90 min",
    description: "Extended session for two joints or more complex needs.",
    features: [
      "Two treatment regions",
      "Extended rehab time",
      "Broader exercise coaching",
      "Ideal for multi-site issues",
    ],
  },
  {
    id: "injury-prevention",
    title: "Injury Prevention Assessment",
    price: "R600",
    period: "45–60 min",
    description: "Movement screening and prevention strategies for active people.",
    features: [
      "Movement and load review",
      "Risk factor identification",
      "Prevention exercise guidance",
      "Training advice",
    ],
  },
  {
    id: "online",
    title: "Online Consultation",
    price: "On request",
    period: "Virtual",
    description: "Guidance, education, and exercise coaching via secure video when suitable.",
    features: [
      "Convenient follow-up option",
      "Exercise programme review",
      "Self-management coaching",
      "Subject to clinical suitability",
    ],
  },
];

export const pricingNotices = {
  cashPractice:
    "This practice is a cash-based practice. Medical aid claims are submitted by patients using a professional statement, available upon request after payment.",
  assessmentOnly:
    "If during the session we find that treatment cannot commence, for any reason, a fee of R180 will be charged for the assessment/consultation that was done.",
  referralLetter:
    "If any referrals need to be written, an additional R100 may be charged.",
  cancellation:
    "Please provide at least 24 hours’ notice to cancel or reschedule. Late cancellations or non-attendance may incur a fee equivalent to the booked session.",
};
