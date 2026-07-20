// De-duplication helpers: canonicalize URLs and normalize titles so the
// same story from multiple outlets (or the same outlet with tracking
// params) is stored only once.

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "cmpid",
  "smid",
  "ref",
  "src",
  "partner",
]);

export function canonicalUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.hash = "";
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    for (const key of [...u.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(key.toLowerCase())) u.searchParams.delete(key);
    }
    let s = u.toString();
    if (s.endsWith("/")) s = s.slice(0, -1);
    return s;
  } catch {
    return raw.trim();
  }
}

/**
 * Normalized title key for near-duplicate detection: lowercase,
 * punctuation stripped, whitespace collapsed. Two headlines that
 * normalize identically are treated as the same story.
 */
export function titleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}
