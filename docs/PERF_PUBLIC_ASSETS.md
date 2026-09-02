# Public asset weight audit (generated for production readiness review)

Largest files in `/public` (uncompressed JPEG/PNG sources):

| File | Approx. size |
|------|----------------|
| `rehab-01.jpg` | 5.7 MB |
| `rehab-12.jpg` | 5.3 MB |
| `practice-2.jpg` | 5.2 MB (hero) |
| `shoulder-pain.jpg` | 3.7 MB |
| `fouza-portrait-2.jpg` | 3.4 MB |

## Current mitigations (code)

- Marketing pages use `next/image` with `priority` only on the homepage hero.
- Service coverflow cards use responsive `sizes` and lazy loading (default).
- Homepage hero now sets `sizes="(max-width: 1024px) 100vw, 50vw"` for responsive srcset.

## Recommended post-launch (manual, preserves visual quality)

1. Re-export hero (`practice-2.jpg`) and portrait assets as progressive JPEG or WebP at ~200–400 KB without visible quality loss.
2. Upload optimized variants; keep originals off-repo or in a non-deployed asset store.
3. Re-run Lighthouse Performance on `https://fouzaphysiotherapy.co.za` after deploy.

Do **not** bulk-compress all `/public` images in-repo without founder sign-off on visual quality.
