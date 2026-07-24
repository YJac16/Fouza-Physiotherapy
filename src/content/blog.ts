import { siteConfig } from "@/config/site";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  featured?: boolean;
  image: string;
  body: string[];
};

export const blogCategories = [
  "Recovery",
  "Back & Neck",
  "Sports",
  "Women's Health",
  "Exercise",
] as const;

export const blogPosts: BlogPost[] = [
  {
    slug: "why-movement-matters-in-recovery",
    title: "Why Movement Matters in Recovery",
    excerpt:
      "Rest has a place — but guided movement is often the most powerful tool for lasting recovery.",
    category: "Recovery",
    readTime: "4 min",
    date: "2026-03-12",
    featured: true,
    image: siteConfig.images.hero,
    body: [
      "When pain appears, it is natural to protect the area and stop moving. Short-term protection can help, but prolonged rest often increases stiffness, weakness, and fear of movement.",
      "At Fouza Physiotherapy we use assessment to find the right dose of movement for your stage of recovery — enough to stimulate healing and confidence, without unnecessary flare-ups.",
      "Your programme will usually combine education, hands-on care where useful, and progressive exercise that matches your daily life and goals.",
    ],
  },
  {
    slug: "desk-setup-for-a-happier-neck",
    title: "Desk Setup Tips for a Happier Neck",
    excerpt:
      "Small workstation changes can reduce end-of-day neck and shoulder tension.",
    category: "Back & Neck",
    readTime: "3 min",
    date: "2026-02-20",
    image: siteConfig.images.clinic,
    body: [
      "Neck discomfort in desk workers is common. Screen height, chair support, and break frequency all influence how your neck feels by evening.",
      "Aim for the top third of your screen near eye level, keep shoulders relaxed, and stand or move briefly every 30–45 minutes.",
      "If symptoms persist, physiotherapy can identify contributing factors and rebuild capacity so posture feels easier — not forced.",
    ],
  },
  {
    slug: "returning-to-sport-after-injury",
    title: "Returning to Sport After Injury",
    excerpt:
      "Pain settling is only one milestone. Strength, control, and confidence matter too.",
    category: "Sports",
    readTime: "5 min",
    date: "2026-01-18",
    image: siteConfig.images.treatment,
    body: [
      "Athletes often feel ready when pain reduces, but tissue capacity and movement quality may still be catching up.",
      "A structured return-to-play plan progresses from simple strength to sport-specific drills with clear criteria at each stage.",
      "This approach reduces re-injury risk and helps you return with more confidence.",
    ],
  },
  {
    slug: "pregnancy-and-pelvic-discomfort",
    title: "Pregnancy and Pelvic Discomfort: When to Seek Help",
    excerpt:
      "Pelvic girdle and back discomfort are common in pregnancy — and physiotherapy can help.",
    category: "Women's Health",
    readTime: "4 min",
    date: "2025-12-05",
    image: siteConfig.images.clinic,
    body: [
      "Hormonal and biomechanical changes can increase sensitivity around the pelvis and lower back during pregnancy.",
      "Supportive assessment, activity advice, and gentle treatment strategies can make daily tasks more comfortable.",
      "Reach out early if walking, turning in bed, or stairs become difficult — you do not need to wait until symptoms are severe.",
    ],
  },
  {
    slug: "building-a-simple-home-exercise-habit",
    title: "Building a Simple Home Exercise Habit",
    excerpt:
      "The best programme is the one you can actually do. Consistency beats complexity.",
    category: "Exercise",
    readTime: "3 min",
    date: "2025-11-10",
    image: siteConfig.images.treatment,
    body: [
      "Home exercises work when they fit your life. Short, clear sessions done regularly outperform long routines abandoned after a week.",
      "We design programmes around your available time, space, and equipment — then progress them as you improve.",
      "If something feels wrong, tell us. Adjustments are part of good care.",
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export function getFeaturedPost() {
  return blogPosts.find((p) => p.featured) ?? blogPosts[0];
}

export function getRelatedPosts(slug: string, limit = 3) {
  return blogPosts.filter((p) => p.slug !== slug).slice(0, limit);
}
