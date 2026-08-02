/**
 * Official Google Business Profile reviews for Fouza Physiotherapy
 * (Place ID ChIJyT3OtXNdzB0RVyqbwWpw4pM — 47 Upper Duke St, Walmer Estate).
 *
 * Places Details API returns at most 5 reviews; this catalog preserves the
 * fuller public review set for display until Business Profile API is wired.
 */

export const googleBusinessProfile = {
  placeId: "ChIJyT3OtXNdzB0RVyqbwWpw4pM",
  mapsUrl:
    "https://www.google.com/maps/place/?q=place_id:ChIJyT3OtXNdzB0RVyqbwWpw4pM",
  writeReviewUrl:
    "https://search.google.com/local/writereview?placeid=ChIJyT3OtXNdzB0RVyqbwWpw4pM",
  rating: 5,
  reviewCount: 26,
  name: "Fouza Physiotherapy",
} as const;

export type OfficialGoogleReview = {
  googleReviewId: string;
  authorName: string;
  rating: number;
  text: string;
  /** Approximate ISO date derived from Google's relative timestamp. */
  reviewedAt: string;
  featured?: boolean;
};

export const officialGoogleReviews: OfficialGoogleReview[] = [
  {
    googleReviewId: "sharn-anne-mitchell-2024",
    authorName: "Sharn Anne Mitchell",
    rating: 5,
    text: "Unlike many other physios I have seen, Fouza takes her time to listen and does thorough work to address issues. The appointment was not rushed and she answered my many questions with patience and provided after care instructions and info on my affected muscles. Highly recommend.",
    reviewedAt: "2024-08-01T00:00:00.000Z",
    featured: true,
  },
  {
    googleReviewId: "laylah-abrahams-2021",
    authorName: "Laylah Abrahams",
    rating: 5,
    text: "Absolutely the best physiotherapist! At Fouza Physiotherapy I received the best treatment. I was efficiently consulted, examined & treated. The clinicians go beyond the call of duty. I was given thorough explanations throughout all my sessions. I would highly recommend them for their high calibre of professionalism & care.",
    reviewedAt: "2021-08-01T00:00:00.000Z",
    featured: true,
  },
  {
    googleReviewId: "tasneem-esau-2022",
    authorName: "Tasneem Esau",
    rating: 5,
    text: "I highly recommend this fabulous physio with her warm bedside manner and skilled hands. I experienced severe sciatica which she helped manage and alleviate with therapy. She taught me exercises to help strengthen my core and back. She is a professional who genuinely cares. Thank you Fouza you were a wonderful find.",
    reviewedAt: "2022-08-01T00:00:00.000Z",
    featured: true,
  },
  {
    googleReviewId: "aysha-abrahams-2021",
    authorName: "Aysha Abrahams",
    rating: 5,
    text: "Fouza is a great Physiotherapist, is knowledgable in what she does and has a genuine interest in the health and wellbeing of her patients. She always takes time to provide you with explanation of her treatments as well as follow up exercises to advance your rehab. I would highly recommend using the services of Fouza Physiotherapy.",
    reviewedAt: "2021-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "amy-cornelissen-2021",
    authorName: "Amy Cornelissen",
    rating: 5,
    text: "Being a person/patient, that loves asking questions and cringes with physical contact. Fouza Physiotherapy definitely catered to my patient specific needs. Warm, knowledgeable, accommodating experience and offers advice that one can utilize in daily living. Would recommend it to anyone searching for value for money, with a smile. Thank you Fouza",
    reviewedAt: "2021-08-01T00:00:00.000Z",
    featured: true,
  },
  {
    googleReviewId: "joshua-huckle-2022",
    authorName: "Joshua Huckle",
    rating: 5,
    text: "Definitely the best experience I've had at a physio. She was able to diagnose my injury immediately and the treatment of the injury went extremely smooth, actually healed up before its supposed to, very affordable, very neat and tidy, extremely clean practice. Would definitely recommend Fouza Physiotherapy.",
    reviewedAt: "2022-08-01T00:00:00.000Z",
    featured: true,
  },
  {
    googleReviewId: "andri-burnett-2021",
    authorName: "Andri Burnett",
    rating: 5,
    text: "Waheedah Harris from Fouza Physiotherapy was extremely helpful in the recovery of my hand after I broke my wrist. I saw steady progress with each session. Their facilities in Walmer estate are easy to access,very well maintained and has a calming atmosphere. Their services are very reasonably priced and I would highly recommend it, for both recovery from injuries or a calming massage.",
    reviewedAt: "2021-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "riyadh-davids-2021",
    authorName: "Riyadh Davids",
    rating: 5,
    text: "Really pleased that I discovered this local practise. Fouza is a knowledgeable and professional therapists that takes her time to understand the cause of my multiple issues to effectively treat the symptoms. Appreciate the constant follow up via ensure that recovery and is going well. Also appreciate the attention to Covid precautionary measures. Highly recommended.",
    reviewedAt: "2021-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "cobus-coetzee-2022",
    authorName: "Cobus Coetzee",
    rating: 5,
    text: "Fouza is very professional and followed up between appointments on my recovery and progress. Excellent facilities and she uses of technology to assist with home recovery, appointment and payment.",
    reviewedAt: "2022-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "ebrahiem-gasnola-2022",
    authorName: "Dr Ebrahiem Gasnola",
    rating: 5,
    text: "Amazing experience! Suffered severe lower back pain, one session with Fouza, majority of the pain alleviated. Follow up was offered and exercises were given, recovery was efficient and effective. Highly recommend.",
    reviewedAt: "2022-08-01T00:00:00.000Z",
    featured: true,
  },
  {
    googleReviewId: "lauren-purdy-2022",
    authorName: "Lauren Purdy",
    rating: 5,
    text: "Fouza was absolutely awesome; she really made me feel comfortable and was always willing to give me some advice. I feel 10 times better and I'll definitely be returning!",
    reviewedAt: "2022-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "paul-tekle-tsadik-2022",
    authorName: "Paul Tekle-Tsadik",
    rating: 5,
    text: "Professional, effective and caring. Dr Fouza's understanding and assessment is personalised and have returned regularly to track my rehab and recovery. Five Stars!",
    reviewedAt: "2022-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "ayesha-mahomed-2021",
    authorName: "Ayesha Mahomed",
    rating: 5,
    text: "Fouza is the sweetest person. Very good at her job. The best physiotherapist I've been to. Very patient.",
    reviewedAt: "2021-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "gabriel-espi-sanchis-2022",
    authorName: "Gabriel Espi-Sanchis",
    rating: 5,
    text: "A really excellent Physio who gives great advice, exercises and is happy to respond to questions. I feel in good hands and great to have someone guiding me to rehabilitation!",
    reviewedAt: "2022-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "shahiem-hartley-2021",
    authorName: "Shahiem Hartley",
    rating: 5,
    text: "Fouza is a great physiotherapist who is bringing her profession and skills to the local community and comes very highly recommended.",
    reviewedAt: "2021-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "uche-dominic-2022",
    authorName: "Uche Dominic",
    rating: 5,
    text: "It was a great experience i must say, all my pain was gone after her massage and exercise with me.. Thank you Fouza physiotherapy please keep it up",
    reviewedAt: "2022-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "top-primate-2025",
    authorName: "Top Primate",
    rating: 5,
    text: "Great service, We send all our broken bodies to be mended after a Muay Thai session",
    reviewedAt: "2025-08-01T00:00:00.000Z",
    featured: true,
  },
  {
    googleReviewId: "rafiqa-abrahams-2021",
    authorName: "Rafiqa Abrahams",
    rating: 5,
    text: "Great team of Physiotherapists with excellent knowledge, care and professionalism. Highly recommended!",
    reviewedAt: "2021-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "w-t-2021",
    authorName: "W T",
    rating: 5,
    text: "Highly recommended physiotherapy practice. Knowledgable and friendly staff with wonderful facilities",
    reviewedAt: "2021-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "wp-wp-2023",
    authorName: "wp wp",
    rating: 5,
    text: "Made a big difference to my neck injury thank u so much",
    reviewedAt: "2023-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "rikotoka-swartz-2022",
    authorName: "Rikotoka Swartz",
    rating: 5,
    text: "Had such a good experience here! My back has never felt better.",
    reviewedAt: "2022-08-01T00:00:00.000Z",
  },
  {
    googleReviewId: "faadiah-jacobs-2021",
    authorName: "Faadiah Jacobs",
    rating: 5,
    text: "Very nice practice with professional physiotherapist. Well done",
    reviewedAt: "2021-08-01T00:00:00.000Z",
  },
];
