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

/** Who persistent-pain care is especially for */
export const persistentPainAudiences = [
  "Persistent pain that has lasted longer than expected",
  "Pain that hasn’t settled as expected",
  "Persistent pain following an injury or surgery",
  "Pain lasting longer than the normal healing time",
];

export const conditions: ConditionContent[] = [
  {
    slug: "back-pain",
    name: "Persistent Low Back Pain",
    summary:
      "Low back pain that continues beyond the usual healing window — limiting work, sleep, or everyday movement.",
    symptoms: [
      "Ongoing or recurring low back discomfort",
      "Stiffness after sitting or waking",
      "Pain with bending, lifting, or prolonged standing",
      "Reduced confidence in movement",
    ],
    causes: [
      "Pain that outlasts expected tissue healing",
      "Previous injury, flare patterns, or deconditioning",
      "Prolonged sitting and reduced activity",
      "Load, stress, and movement-related sensitivity",
    ],
    treatment: [
      "Thorough assessment and clear pain education",
      "Hands-on therapy where helpful",
      "Graded exercise and load management",
      "Practical advice for work and daily life",
    ],
    recovery:
      "Persistent low back pain responds best to a structured rehab plan that rebuilds confidence and capacity — not prolonged rest.",
    faqs: [
      {
        question: "Should I stay in bed with back pain?",
        answer:
          "Usually not. Gentle, guided movement is generally better than extended bed rest.",
      },
    ],
    image: siteConfig.images.backRehab,
  },
  {
    slug: "neck-pain",
    name: "Chronic Neck Pain",
    summary:
      "Neck pain or stiffness that hasn’t settled as expected — often linked to posture, stress, or previous overload.",
    symptoms: [
      "Ongoing neck stiffness or aching",
      "Pain turning the head",
      "Shoulder or upper-back tension",
      "Symptoms that flare with desk or device use",
    ],
    causes: [
      "Pain lasting longer than expected healing time",
      "Desk and device posture",
      "Sleep position strain",
      "Previous injury or recurrent flare patterns",
    ],
    treatment: [
      "Mobility and soft tissue care",
      "Pain education and pacing strategies",
      "Posture and ergonomic coaching",
      "Strengthening for neck and shoulder girdle",
    ],
    recovery:
      "Chronic neck pain often improves with graded loading, habit changes, and a clear plan you can stick to between sessions.",
    faqs: [
      {
        question: "Can physiotherapy help headaches from my neck?",
        answer:
          "Yes, when the neck is a contributing factor. We assess this carefully and treat accordingly.",
      },
    ],
    image: siteConfig.images.posture,
  },
  {
    slug: "shoulder-pain",
    name: "Persistent Shoulder Pain",
    summary:
      "Shoulder pain or weakness that continues with reaching, lifting, or sleep — including pain that hasn’t settled after injury or overload.",
    symptoms: [
      "Pain with overhead movement",
      "Night pain when lying on the shoulder",
      "Reduced strength or range",
      "Avoidance of daily or work tasks",
    ],
    causes: [
      "Rotator cuff related irritation",
      "Overuse or sudden load",
      "Pain continuing beyond expected healing",
      "Stiffness syndromes such as frozen shoulder",
    ],
    treatment: [
      "Load management and education",
      "Mobility restoration",
      "Progressive strengthening",
      "Work- or activity-specific rehab",
    ],
    recovery:
      "Consistent, graded loading is usually more effective than complete rest. Timelines vary — we track progress against your goals.",
    faqs: [
      {
        question: "Do I need surgery for shoulder pain?",
        answer:
          "Most people improve with physiotherapy first. Surgery is considered for specific cases after appropriate assessment.",
      },
    ],
    image: siteConfig.images.shoulderRehab,
  },
  {
    slug: "knee-pain",
    name: "Chronic Hip and Knee Pain",
    summary:
      "Hip or knee pain that persists with walking, stairs, sport, or daily activity — including osteoarthritis-related and post-injury patterns.",
    symptoms: [
      "Pain with stairs, squatting, or walking",
      "Hip stiffness or groin discomfort",
      "Swelling or reduced confidence in the joint",
      "Clicking or giving-way sensations",
    ],
    causes: [
      "Overuse and training errors",
      "Previous injury or surgery",
      "Osteoarthritis-related change",
      "Pain lasting longer than the normal healing time",
    ],
    treatment: [
      "Strengthening of hip and knee musculature",
      "Movement retraining and load management",
      "Activity pacing",
      "Return-to-activity planning when needed",
    ],
    recovery:
      "Strength-focused rehab is highly effective for many hip and knee conditions. Progress is tracked against the activities that matter to you.",
    faqs: [
      {
        question: "Can I walk if my hip or knee hurts?",
        answer:
          "Often yes, with guidance on distance, surface, and supportive loading. We help you find the right dose.",
      },
    ],
    image: siteConfig.images.kneeAnkle,
  },
  {
    slug: "tendon-pain",
    name: "Persistent Tendon Pain",
    summary:
      "Tendon-related pain that continues with loading — such as Achilles, patellar, or gluteal tendon pain that hasn’t settled with rest alone.",
    symptoms: [
      "Localised tendon pain with activity",
      "Morning stiffness or start-up pain",
      "Pain that eases then returns with load",
      "Reduced capacity for sport or work",
    ],
    causes: [
      "Sudden spikes in training or activity load",
      "Under-recovery between sessions",
      "Previous injury or biomechanical contributors",
      "Pain continuing beyond expected tissue adaptation",
    ],
    treatment: [
      "Education on tendon load and recovery",
      "Progressive strengthening programmes",
      "Activity modification without complete rest",
      "Graded return to sport or work demands",
    ],
    recovery:
      "Tendons respond to the right dose of loading over time. A structured plan rebuilds capacity while managing symptoms.",
    faqs: [
      {
        question: "Should I stop all activity with tendon pain?",
        answer:
          "Usually not. Complete rest often doesn’t solve tendon pain. We help you adjust load while building strength.",
      },
    ],
    image: siteConfig.images.sports,
  },
  {
    slug: "fibromyalgia",
    name: "Fibromyalgia",
    summary:
      "Widespread persistent pain and fatigue that affects sleep, mood, and daily function — supported with paced, confidence-building physiotherapy.",
    symptoms: [
      "Widespread body pain or tenderness",
      "Fatigue and non-restorative sleep",
      "Flare patterns with activity or stress",
      "Reduced confidence in movement",
    ],
    causes: [
      "Central sensitisation and altered pain processing",
      "Sleep disruption and stress load",
      "Deconditioning from prolonged symptom avoidance",
      "Multifactorial contributors unique to each person",
    ],
    treatment: [
      "Pain education and flare planning",
      "Gentle, graded activity programmes",
      "Pacing and energy management strategies",
      "Coordination with your broader medical care",
    ],
    recovery:
      "Improvement is often gradual. The focus is helping you make sense of symptoms, move with more confidence, and return to valued activities.",
    faqs: [
      {
        question: "Is exercise safe with fibromyalgia?",
        answer:
          "Yes — when paced appropriately. We start gently and progress in a way that respects your energy and flare patterns.",
      },
    ],
    image: siteConfig.images.clinic,
  },
  {
    slug: "arthritis",
    name: "Osteoarthritis",
    summary:
      "Joint pain and stiffness related to osteoarthritis — supporting strength, mobility, and confidence so you stay active.",
    symptoms: [
      "Morning stiffness",
      "Pain with weight-bearing",
      "Reduced joint confidence",
      "Activity-related flares",
    ],
    causes: [
      "Age-related joint changes",
      "Previous injury",
      "Reduced muscle support around the joint",
      "Load and activity patterns",
    ],
    treatment: [
      "Education and flare management",
      "Strength and mobility programmes",
      "Activity pacing strategies",
      "Supportive manual therapy as needed",
    ],
    recovery:
      "Physiotherapy helps many people with osteoarthritis stay active and independent. Exercise is one of the most effective treatments for symptoms.",
    faqs: [
      {
        question: "Is exercise safe with osteoarthritis?",
        answer:
          "Yes — the right exercise is one of the most effective treatments for osteoarthritis symptoms.",
      },
    ],
    image: siteConfig.images.clinic,
  },
  {
    slug: "post-operative-rehabilitation",
    name: "Persistent Pain After Surgery",
    summary:
      "Pain that continues after surgery beyond the expected healing time — plus structured rehab to restore mobility, strength, and independence.",
    symptoms: [
      "Pain lasting longer than expected post-surgery",
      "Stiffness, weakness, or reduced confidence",
      "Swelling that limits progress",
      "Difficulty returning to usual activities",
    ],
    causes: [
      "Pain sensitisation beyond tissue healing timelines",
      "Immobilisation and deconditioning effects",
      "Scar, swelling, or movement fear",
      "Incomplete graded return to load",
    ],
    treatment: [
      "Assessment of healing stage and pain drivers",
      "Protocol-aligned progression where appropriate",
      "Strength and function rebuilding",
      "Return-to-life planning with clear milestones",
    ],
    recovery:
      "When pain continues beyond expected healing, a structured plan — education, graded loading, and coordinated care — helps restore confidence and function.",
    faqs: [
      {
        question: "Can I start physio before my follow-up with the surgeon?",
        answer:
          "Often yes, within protocol limits. Bring your operation notes if available.",
      },
    ],
    image: siteConfig.images.postOp,
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
    image: siteConfig.images.manualTherapy,
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
    image: siteConfig.images.sports,
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
    image: siteConfig.images.posture,
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
    image: siteConfig.images.posture,
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
    image: siteConfig.images.shoulderRehab,
  },
];

export function getCondition(slug: string) {
  return conditions.find((c) => c.slug === slug);
}

export function conditionHref(slug: string) {
  return routes.marketing.condition(slug);
}
