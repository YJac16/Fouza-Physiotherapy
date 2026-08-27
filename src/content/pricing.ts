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
    price: "R800",
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
    price: "R700",
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
    price: "R900",
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
];

export const pricingNotices = {
  paymentInformation: {
    title: "Payment Information",
    body: "We believe healthcare should be straightforward. Payment is made directly to the practice after your consultation. As we are not contracted to medical aid schemes, payment cannot be claimed directly from the practice.",
  },
  medicalAidClaims: {
    title: "Medical Aid Claims",
    body: "If you wish to claim from your medical aid, we are happy to provide a detailed statement on request. Please contact your medical aid directly to confirm your available benefits, level of cover, and reimbursement, as these vary between schemes and plans. Fouza Physiotherapy is not responsible for determining your medical aid benefits or the outcome of any claims.",
  },
  assessmentOnly:
    "If during the session we find that treatment cannot commence, for any reason, a fee of R180 will be charged for the assessment/consultation that was done.",
  referralLetter:
    "If any referrals need to be written, an additional R100 will be charged.",
  cancellation:
    "Please cancel or reschedule at least 6 hours before your appointment. Late cancellations or missed appointments incur a fee of 50% of the consultation fee.",
};

/** Shared cancellation policy for consent forms and booking copy. */
export const cancellationPolicyNotice = pricingNotices.cancellation;

export const cancellationPolicyUndertaking =
  "That appointments not kept will be charged 50% of the consultation fee if not cancelled at least 6 hours beforehand.";
