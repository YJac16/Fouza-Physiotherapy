export type FaqItem = {
  id: string;
  category:
    | "Booking"
    | "Payments"
    | "Medical Aid"
    | "Treatment"
    | "Dry Needling"
    | "Cancellation"
    | "Exercise Programmes";
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    id: "book-1",
    category: "Booking",
    question: "How do I book an appointment?",
    answer:
      "You can book online or contact the practice via WhatsApp or email. We will confirm a suitable time for your assessment or follow-up.",
  },
  {
    id: "book-2",
    category: "Booking",
    question: "Do I need a doctor’s referral?",
    answer:
      "No referral is required to see a physiotherapist in South Africa. You may book directly.",
  },
  {
    id: "book-3",
    category: "Booking",
    question: "What should I bring to my first visit?",
    answer:
      "Please bring any relevant medical reports, imaging, a list of medications, and comfortable clothing that allows assessment of the affected area.",
  },
  {
    id: "pay-1",
    category: "Payments",
    question: "How does payment work?",
    answer:
      "Fouza Physiotherapy is a cash-based practice. Payment is due after your session. A professional statement can be provided for you to submit to your medical aid.",
  },
  {
    id: "pay-2",
    category: "Payments",
    question: "What payment methods are accepted?",
    answer:
      "Please enquire when booking. Card and EFT options are typically available; confirm preferred methods with the practice.",
  },
  {
    id: "aid-1",
    category: "Medical Aid",
    question: "Do you claim directly from medical aids?",
    answer:
      "No. Patients settle accounts with the practice and submit the provided statement to their medical aid for reimbursement according to their plan.",
  },
  {
    id: "aid-2",
    category: "Medical Aid",
    question: "Will my medical aid cover physiotherapy?",
    answer:
      "Cover depends on your plan and available benefits. Please check with your medical aid. We provide the documentation you need to claim.",
  },
  {
    id: "tx-1",
    category: "Treatment",
    question: "What happens in the first consultation?",
    answer:
      "We take a detailed history, assess movement, discuss findings in plain language, begin appropriate treatment, and outline a personalised plan.",
  },
  {
    id: "tx-2",
    category: "Treatment",
    question: "How many sessions will I need?",
    answer:
      "It depends on your condition, goals, and response to care. After assessment we discuss an expected pathway and review progress regularly.",
  },
  {
    id: "tx-3",
    category: "Treatment",
    question: "Do you offer home visits or sports / women’s health physiotherapy?",
    answer:
      "These can sometimes be arranged when clinically appropriate and subject to availability. Message us via WhatsApp or the contact form if you need to discuss suitability.",
  },
  {
    id: "dn-1",
    category: "Dry Needling",
    question: "Is dry needling safe?",
    answer:
      "When performed by a trained physiotherapist after consent and screening, dry needling is generally safe. We explain risks and aftercare beforehand.",
  },
  {
    id: "dn-2",
    category: "Dry Needling",
    question: "Can I decline dry needling?",
    answer:
      "Absolutely. Treatment is collaborative. Alternative techniques are always available.",
  },
  {
    id: "cancel-1",
    category: "Cancellation",
    question: "What is the cancellation policy?",
    answer:
      "Please provide at least 24 hours’ notice if you need to cancel or reschedule. Late cancellations or non-attendance may incur a fee.",
  },
  {
    id: "cancel-2",
    category: "Cancellation",
    question: "What if treatment cannot commence during a session?",
    answer:
      "If during the session we find that treatment cannot commence for any reason, an assessment/consultation fee of R180 may be charged.",
  },
  {
    id: "ex-1",
    category: "Exercise Programmes",
    question: "Will I receive exercises to do at home?",
    answer:
      "Yes. Home exercise is a core part of recovery. Programmes are tailored to your ability, equipment, and goals.",
  },
  {
    id: "ex-2",
    category: "Exercise Programmes",
    question: "What if exercises increase my pain?",
    answer:
      "Some mild discomfort can be normal, but sharp or escalating pain is not. Contact us so we can adjust your programme.",
  },
];

export const faqCategories = [
  "Booking",
  "Payments",
  "Medical Aid",
  "Treatment",
  "Dry Needling",
  "Cancellation",
  "Exercise Programmes",
] as const;

export const faqPreviewIds = ["book-1", "pay-1", "aid-1", "tx-1", "cancel-1", "ex-1"];
