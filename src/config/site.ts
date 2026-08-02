export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Fouza Physiotherapy",
  practiceName: process.env.NEXT_PUBLIC_PRACTICE_NAME ?? "Fouza Physiotherapy",
  tagline: "Strength · Rehab · Function",
  description:
    "Evidence-based physiotherapy in Walmer Estate, Cape Town — with a special interest in persistent pain, helping you move better, feel better, and live better.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  email:
    process.env.NEXT_PUBLIC_PRACTICE_EMAIL ?? "fouza.physiotherapy@gmail.com",
  phone: process.env.NEXT_PUBLIC_PRACTICE_PHONE ?? "+27645136210",
  phoneDisplay: "+27 64 513 6210",
  address:
    process.env.NEXT_PUBLIC_PRACTICE_ADDRESS ??
    "47 Upper Duke Street, Walmer Estate, Cape Town, 7925",
  addressShort: "Walmer Estate, Cape Town",
  city: "Cape Town",
  region: "Western Cape",
  postalCode: "7925",
  country: "ZA",
  geo: {
    lat: -33.9405,
    lng: 18.4485,
  },
  whatsapp: "27645136210",
  whatsappUrl: "https://wa.me/27645136210",
  bookingExternalUrl: "https://fouzaphysiotherapy.setmore.com/",
  social: {
    instagram: "",
    facebook: "",
    google: process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? "",
  },
  hours: [
    { day: "Monday", opens: "09:00", closes: "17:00" },
    { day: "Tuesday", opens: "09:00", closes: "17:00" },
    { day: "Wednesday", opens: "09:00", closes: "17:00" },
    { day: "Thursday", opens: "09:00", closes: "17:00" },
    { day: "Friday", opens: "09:00", closes: "17:00" },
    { day: "Saturday", opens: null, closes: null },
    { day: "Sunday", opens: null, closes: null },
  ] as const,
  hoursSummary: "Mon–Fri · 09:00–17:00",
  founder: {
    name: "Fouza Abrahams",
    title: "Founder & Physiotherapist",
    credentials: "BSc Physiotherapy (UCT)",
    registration: "HPCSA Registered Physiotherapist",
    /** Update when confirmed publicly; do not invent registration numbers. */
    practiceNumber: process.env.NEXT_PUBLIC_PRACTICE_NUMBER ?? "",
  },
  links: {
    book: "/book",
    portal: "/portal",
    admin: "/admin",
    blog: "/blog",
    login: "/login",
  },
  images: {
    logo: "/fouza-physiotherapy-logo.png",
    logoWordmark: "/fouza-physiotherapy-logo-wordmark.png",
    /** Light lettering for dark backgrounds — same layout as `logoWordmark`. */
    logoWordmarkDark: "/fouza-physiotherapy-logo-wordmark-dark.png",
    favicon: "/favicon-32x32.png",
    appleTouchIcon: "/apple-touch-icon.png",
    hpcsa: "/hpcsa-logo.png",
    /** Clinic waiting area — primary marketing hero */
    hero: "/facilities-08.jpg",
    portrait: "/fouza-portrait-1.jpg",
    /** Rehab gym corner with equipment */
    clinic: "/facilities-04.jpg",
    /** Hands-on table assessment / manual therapy */
    treatment: "/rehab-02.jpg",
    sports: "/rehab-03.jpg",
    manualTherapy: "/rehab-02.jpg",
    softTissue: "/rehab-08.jpg",
    backRehab: "/rehab-05.jpg",
    posture: "/rehab-06.jpg",
    shoulderRehab: "/rehab-05.jpg",
    kneeAnkle: "/rehab-04.jpg",
    postOp: "/rehab-10.jpg",
    assessment: "/rehab-09.jpg",
    og: "/facilities-08.jpg",
  },
} as const;

export type SiteConfig = typeof siteConfig;

export function telHref(phone = siteConfig.phone) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

export function mapsQueryUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address)}`;
}
