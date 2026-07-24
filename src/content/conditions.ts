import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export type ConditionContent = {
  slug: string;
  name: string;
  summary: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  recovery: string;
  faqs: { question: string; answer: string }[];
  image: string;
};

export const conditions: ConditionContent[] = [
  {
    slug: "back-pain",
    name: "Back Pain",
    summary:
      "Acute or persistent back discomfort that limits work, sleep, or everyday movement.",
    symptoms: [
      "Localised or radiating back discomfort",
      "Stiffness after sitting or waking",
      "Pain with bending, lifting, or prolonged standing",
    ],
    causes: [
      "Sudden load or awkward movement",
      "Prolonged sitting and reduced activity",
      "Previous injury or deconditioning",
    ],
    treatment: [
      "Thorough assessment and reassurance",
      "Hands-on therapy where helpful",
      "Graded exercise and load management",
      "Practical advice for work and daily life",
    ],
    recovery:
      "Many people improve within weeks with guided activity. Persistent pain benefits from a structured rehab plan rather than prolonged rest.",
    faqs: [
      {
        question: "Should I stay in bed with back pain?",
        answer:
          "Usually not. Gentle, guided movement is generally better than extended bed rest.",
      },
    ],
    image: siteConfig.images.hero,
  },
  {
    slug: "neck-pain",
    name: "Neck Pain",
    summary:
      "Neck stiffness, tension, or pain — often linked to posture, stress, or sudden movements.",
    symptoms: [
      "Neck stiffness or aching",
      "Pain turning the head",
      "Shoulder or upper-back tension",
    ],
    causes: [
      "Desk and device posture",
      "Sleep position strain",
      "Sudden movement or overload",
    ],
    treatment: [
      "Mobility and soft tissue care",
      "Posture and ergonomic coaching",
      "Strengthening for neck and shoulder girdle",
    ],
    recovery:
      "Most neck pain settles with early, appropriate care. Recurrence can be reduced with strength and habit changes.",
    faqs: [
      {
        question: "Can physiotherapy help headaches from my neck?",
        answer:
          "Yes, when the neck is a contributing factor. We assess this carefully and treat accordingly.",
      },
    ],
    image: siteConfig.images.hero,
  },
  {
    slug: "sciatica",
    name: "Sciatica",
    summary:
      "Leg pain, tingling, or numbness related to irritation of the sciatic nerve pathway.",
    symptoms: [
      "Pain radiating into the buttock or leg",
      "Pins and needles or numbness",
      "Discomfort with sitting or walking",
    ],
    causes: [
      "Nerve root irritation",
      "Disc-related sensitivity",
      "Muscle and joint contributions",
    ],
    treatment: [
      "Neurodynamic and mobility strategies",
      "Targeted strengthening",
      "Activity modification guidance",
      "Referral pathways if red flags appear",
    ],
    recovery:
      "Many cases improve with conservative care. Persistent or progressive neurological symptoms need prompt medical review.",
    faqs: [
      {
        question: "Is sciatica always a disc problem?",
        answer:
          "Not always. Several structures can contribute. Assessment helps clarify the likely drivers.",
      },
    ],
    image: siteConfig.images.treatment,
  },
  {
    slug: "shoulder-pain",
    name: "Shoulder Pain",
    summary:
      "Pain or weakness with reaching, lifting, or sleeping on the affected side.",
    symptoms: [
      "Pain with overhead movement",
      "Night pain when lying on the shoulder",
      "Reduced strength or range",
    ],
    causes: [
      "Rotator cuff related irritation",
      "Overuse or sudden load",
      "Stiffness syndromes such as frozen shoulder",
    ],
    treatment: [
      "Load management and education",
      "Mobility restoration",
      "Progressive strengthening",
      "Sport or work-specific rehab",
    ],
    recovery:
      "Timelines vary by diagnosis. Consistent, graded loading is usually more effective than complete rest.",
    faqs: [
      {
        question: "Do I need surgery for shoulder pain?",
        answer:
          "Most people improve with physiotherapy first. Surgery is considered for specific cases after appropriate assessment.",
      },
    ],
    image: siteConfig.images.treatment,
  },
  {
    slug: "knee-pain",
    name: "Knee Pain",
    summary:
      "Pain around the knee with walking, stairs, sport, or prolonged sitting.",
    symptoms: [
      "Pain with stairs or squatting",
      "Swelling or stiffness",
      "Clicking or giving-way sensations",
    ],
    causes: [
      "Overuse and training errors",
      "Ligament or meniscus related injury",
      "Osteoarthritis related change",
    ],
    treatment: [
      "Strengthening of hip and knee musculature",
      "Movement retraining",
      "Activity pacing",
      "Return-to-sport planning when needed",
    ],
    recovery:
      "Strength-focused rehab is highly effective for many knee conditions. Progress is tracked against your goals.",
    faqs: [
      {
        question: "Can I walk if my knee hurts?",
        answer:
          "Often yes, with guidance on distance, surface, and supportive loading. We help you find the right dose.",
      },
    ],
    image: siteConfig.images.clinic,
  },
  {
    slug: "sports-injuries",
    name: "Sports Injuries",
    summary:
      "Muscle, tendon, and joint injuries from training, competition, or weekend activity.",
    symptoms: [
      "Sudden or gradual onset sports pain",
      "Reduced performance or confidence",
      "Swelling, bruising, or restricted motion",
    ],
    causes: [
      "Training load spikes",
      "Contact or non-contact mechanisms",
      "Insufficient recovery or warm-up",
    ],
    treatment: [
      "Accurate injury diagnosis",
      "Early protection then progressive loading",
      "Sport-specific conditioning",
      "Return-to-play criteria",
    ],
    recovery:
      "Recovery timelines depend on tissue healing and sport demands. We guide each stage clearly.",
    faqs: [
      {
        question: "When can I return to sport?",
        answer:
          "When strength, control, and confidence meet agreed criteria — not only when pain settles.",
      },
    ],
    image: siteConfig.images.treatment,
  },
  {
    slug: "arthritis",
    name: "Arthritis",
    summary:
      "Joint pain and stiffness related to osteoarthritis or inflammatory joint conditions.",
    symptoms: [
      "Morning stiffness",
      "Pain with weight-bearing",
      "Reduced joint confidence",
    ],
    causes: [
      "Age-related joint changes",
      "Previous injury",
      "Inflammatory conditions (medically managed)",
    ],
    treatment: [
      "Education and flare management",
      "Strength and mobility programmes",
      "Activity pacing strategies",
      "Supportive manual therapy as needed",
    ],
    recovery:
      "Physiotherapy helps many people stay active and independent. We coordinate with your broader medical care when needed.",
    faqs: [
      {
        question: "Is exercise safe with arthritis?",
        answer:
          "Yes — the right exercise is one of the most effective treatments for osteoarthritis symptoms.",
      },
    ],
    image: siteConfig.images.clinic,
  },
  {
    slug: "pregnancy-pain",
    name: "Pregnancy Related Pain",
    summary:
      "Back, pelvic, and joint discomfort associated with pregnancy and postural change.",
    symptoms: [
      "Pelvic girdle or low back pain",
      "Hip or rib discomfort",
      "Difficulty with walking, turning in bed, or daily tasks",
    ],
    causes: [
      "Hormonal and biomechanical change",
      "Altered posture and load",
      "Activity demands of pregnancy",
    ],
    treatment: [
      "Pregnancy-safe assessment",
      "Supportive manual therapy",
      "Activity and position advice",
      "Gentle strengthening where appropriate",
    ],
    recovery:
      "Many symptoms improve with tailored support. Postnatal follow-up can continue the recovery journey.",
    faqs: [
      {
        question: "Is physiotherapy safe while pregnant?",
        answer:
          "Yes, with appropriate modifications. We prioritise comfort and safety at every stage.",
      },
    ],
    image: siteConfig.images.clinic,
  },
  {
    slug: "headaches",
    name: "Headaches",
    summary:
      "Headaches that may be influenced by neck mobility, posture, or muscle tension.",
    symptoms: [
      "Head pain linked to neck movement",
      "Tension around the base of the skull",
      "Associated neck stiffness",
    ],
    causes: [
      "Cervicogenic contributions",
      "Desk posture and muscle tension",
      "Stress-related guarding",
    ],
    treatment: [
      "Neck and upper-quarter assessment",
      "Manual therapy and mobility work",
      "Posture and load advice",
      "Self-management strategies",
    ],
    recovery:
      "When the neck is involved, targeted physiotherapy can reduce frequency and intensity. Medical causes are screened carefully.",
    faqs: [
      {
        question: "When should I see a doctor for headaches?",
        answer:
          "Seek urgent care for sudden severe headache, neurological symptoms, or headache after trauma.",
      },
    ],
    image: siteConfig.images.hero,
  },
  {
    slug: "frozen-shoulder",
    name: "Frozen Shoulder",
    summary:
      "Progressive shoulder stiffness and pain that limits daily reaching and sleep.",
    symptoms: [
      "Gradual loss of shoulder range",
      "Pain with dressing or reaching",
      "Night pain",
    ],
    causes: [
      "Capsular restriction",
      "Sometimes follows injury or immobilisation",
      "More common in certain medical contexts",
    ],
    treatment: [
      "Stage-appropriate mobilisation",
      "Pain education",
      "Graded stretching and strengthening",
      "Functional goal setting",
    ],
    recovery:
      "Frozen shoulder often improves over months. Physiotherapy helps maintain function and guide each phase.",
    faqs: [
      {
        question: "Will my shoulder get stuck forever?",
        answer:
          "Most people regain useful movement over time. Consistent, guided rehab supports that process.",
      },
    ],
    image: siteConfig.images.treatment,
  },
  {
    slug: "post-operative-rehabilitation",
    name: "Post-operative Rehabilitation",
    summary:
      "Guided recovery after surgery to restore mobility, strength, and independence.",
    symptoms: [
      "Post-surgical stiffness or weakness",
      "Swelling and reduced confidence",
      "Difficulty returning to usual activities",
    ],
    causes: [
      "Expected tissue healing after surgery",
      "Immobilisation effects",
      "Deconditioning",
    ],
    treatment: [
      "Protocol-aligned progression",
      "Swelling and mobility management",
      "Strength and function rebuilding",
      "Return-to-life planning",
    ],
    recovery:
      "Timelines follow surgical and tissue healing guidelines. We coordinate with your surgeon’s advice.",
    faqs: [
      {
        question: "Can I start physio before my follow-up with the surgeon?",
        answer:
          "Often yes, within protocol limits. Bring your operation notes if available.",
      },
    ],
    image: siteConfig.images.clinic,
  },
];

export function getCondition(slug: string) {
  return conditions.find((c) => c.slug === slug);
}

export function conditionHref(slug: string) {
  return routes.marketing.condition(slug);
}
