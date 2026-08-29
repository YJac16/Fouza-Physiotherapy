/**
 * Responsive `sizes` for marketing photos so next/image does not
 * request a 4K variant for a card or half-viewport hero.
 */
export const marketingImageSizes = {
  /** Homepage / about hero (half of max-w-6xl, or full width on small screens). */
  hero: "(max-width: 767px) 92vw, (max-width: 1280px) 45vw, 560px",
  /** Meet Fouza / about portrait column. */
  portrait: "(max-width: 767px) 92vw, (max-width: 1280px) 42vw, 520px",
  /** Snap coverflow tiles (~18rem wide). */
  coverflow: "(max-width: 640px) 68vw, 300px",
  /** Service / article cards in 1–3 column grids. */
  card: "(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 400px",
  /** About / meet-fouza gallery mosaics. */
  gallery: "(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 33vw",
  /** Service and condition detail heroes. */
  detail: "(max-width: 767px) 92vw, 50vw",
  /** Blog article banner. */
  article: "(max-width: 767px) 100vw, 1100px",
} as const;

/** Cap next/image srcset so a 1280 laptop never fetches a 3840-wide asset. */
export const marketingDeviceSizes = [640, 750, 828, 1080, 1200, 1920] as const;
