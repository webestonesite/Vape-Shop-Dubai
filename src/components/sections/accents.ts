/**
 * Named accent colours a merchant can pick per card or row.
 *
 * The admin offers a list of names, not a colour picker: each tint here is a
 * matched set of background, text and border that sits correctly on both
 * themes. A free-form hex would satisfy one of the three and break the others.
 *
 * Classes are written out in full because Tailwind scans source text — a class
 * built by interpolation would never reach the stylesheet.
 */
export const ACCENT_TINTS: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  teal: "bg-teal-500/10 text-teal-500 border-teal-500/20",
};

/** Softer wash of the same palette, for panels rather than icon chips. */
export const ACCENT_WASHES: Record<string, string> = {
  emerald: "from-emerald-500/10 to-emerald-500/5",
  amber: "from-amber-500/10 to-amber-500/5",
  blue: "from-blue-500/10 to-blue-500/5",
  purple: "from-purple-500/10 to-purple-500/5",
  rose: "from-rose-500/10 to-rose-500/5",
  teal: "from-teal-500/10 to-teal-500/5",
};

