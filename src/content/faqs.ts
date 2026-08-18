export type FaqItem = {
  id: string;
  category:
    | "Booking"
    | "Payments"
    | "Medical Aid"
    | "Treatment"
    | "Dry Needling"
    | "Cancellation"
    | "Exercise Programmes"
    | "Website";
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
      "We believe healthcare should be straightforward. Payment is made directly to the practice after your consultation. As we are not contracted to medical aid schemes, payment cannot be claimed directly from the practice.",
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
      "No. If you wish to claim from your medical aid, we are happy to provide a detailed statement on request. Fouza Physiotherapy is not responsible for determining your medical aid benefits or the outcome of any claims.",
  },
  {
    id: "aid-2",
    category: "Medical Aid",
    question: "Will my medical aid cover physiotherapy?",
    answer:
      "Please contact your medical aid directly to confirm your available benefits, level of cover, and reimbursement, as these vary between schemes and plans.",
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
  {
    id: "web-1",
    category: "Website",
    question: "Can I add Fouza Physiotherapy to my phone’s Home Screen?",
    answer:
      "Yes. The website can be installed like a web app so it opens full-screen from your Home Screen. On iPhone or iPad in Safari, tap Share, then Add to Home Screen. On Android Chrome, use the browser menu or the on-site Add to Home Screen prompt when it appears.",
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
  "Website",
] as const;

export const faqPreviewIds = ["book-1", "pay-1", "aid-1", "tx-1", "cancel-1", "ex-1"];
