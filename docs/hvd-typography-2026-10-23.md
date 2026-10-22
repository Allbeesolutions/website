# AllBee Website — HVD typography application

**Scope:** Customer-facing AllBee Website only (24 public pages). **Date:** 23 October 2026.

HVD means **HajiHaz Visual DNA**. The reference direction is distinctive, premium, expressive typography without generic AI-template aesthetics. AllBee keeps its established teal/yellow palette, white/dark surfaces, page layout, motion, navigation, checkout, product copy, and interactions.

## Approved typography roles

| Role | Typeface | Usage |
|---|---|---|
| Headlines and primary display | **Bricolage Grotesque** | Hero headings, section headings, page titles, prominent brand labels and pricing headlines |
| Readable product UI | **Instrument Sans** | Body paragraphs, navigation, buttons, labels, form inputs, pricing details, legal pages and customer flows |
| Fallback | System sans-serif | Used before hosted fonts arrive or when users block remote font requests |

Both fonts are open-source under SIL Open Font License 1.1. Fonts are loaded using the [Google Fonts API](https://fonts.google.com/) with `display=swap` and preconnects; no unlicensed commercial font files or copied proprietary assets were added. Sources: [Bricolage Grotesque by Mathieu Triay](https://github.com/ateliertriay/bricolage) and [Instrument Sans by Instrument](https://github.com/Instrument/instrument-sans).

## Implementation

- `/assets/hvd-typography.css` centrally defines `--font-display` and `--font-body`; existing page-specific CSS only has font-family substitutions, **not** new layout or color rules.
- Updated the font-loading stylesheet on all **24 root public HTML pages** except the search-engine verification file. Each requests only the same two families with `font-display: swap`.
- Existing shared and page-specific CSS references are consistent with the new family pair.
- Kept **five admin dashboard pages** and **39 separate invitation demo designs** unchanged. Invitation templates are product-specific artworks, not generic site UI.
- Preserved homepage introductory text at its original two-line desktop measure with a small typography-only tracking adjustment; page dimensions, font sizes and animation rules remain intact.

## Regression / rollback

`node scripts/hvd-typography-check.mjs` verifies scope isolation, Google Font requests, CSS family consistency and the public override. The strict CSP Chromium smoke verifies computed body and heading family across desktop, narrow/mobile and tablet routes, as well as existing modal, analytics-consent, checkout summary and demo interactions.

The public Google Fonts CSS endpoint was checked for HTTP 200. If fonts are blocked, system fallback fonts display immediately. This does not require a PWA cache or offline font binary. Offline first-launch on a device without a cache is not claimed to have the same glyphs.

To revert, restore the previous commit or remove the HVD CSS link, restore the original Google Fonts URLs and source font-family tokens. Do not change admin or invitation-demo font definitions during rollback.
