import React from 'react';

/**
 * Qatom mark — the open Q whose tail crosses the bowl.
 *
 * Artwork from the Brand OS approved set, via the currentColor derivation:
 * the ink hex replaced with `currentColor`, same viewBox, same paths. It
 * inherits the header's text colour, so it follows the theme rather than
 * pinning a hex the Qatom palette does not contain.
 *
 * The mark is stroke-drawn, not filled — do not add a `fill`.
 *
 * The mark rather than the full lockup, because this sits beside the
 * "Micro Documentation" title: a lockup here would set the word "Qatom"
 * twice over, once as artwork and once as the heading next to it.
 */
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-0.795 -0.795 184.495 184.495"
      role="img"
      aria-label="Qatom"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Qatom</title>
      <path fill="none" stroke="currentColor" strokeWidth="14" d="M72.48 146.85C35.069 144.432 6.205 112.97 7.012 75.49C7.819 38.01 38.01 7.819 75.49 7.012C112.97 6.205 144.432 35.069 146.85 72.48" />
      <path fill="none" stroke="currentColor" strokeWidth="14" d="M166.65 101.17C164.441 136.378 136.378 164.441 101.17 166.65" />
      <path fill="none" stroke="currentColor" strokeWidth="14" d="M47.3 176.7L176.7 47.3" />
    </svg>
  );
}
