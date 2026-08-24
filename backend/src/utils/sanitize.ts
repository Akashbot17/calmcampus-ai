/**
 * CalmCampus AI — XSS Protection Utilities
 * ------------------------------------------------------------------
 * This module is the server-side half of the application's primary
 * security control: Cross-Site Scripting (XSS) prevention.
 *
 * Principle: ALL user-controlled text (chat messages, mood notes,
 * study notes, profile fields) is treated as untrusted. It is never
 * trusted to contain safe markup, and it is never written into a
 * response, a database record, or (on the client) the DOM without
 * being validated and sanitized first.
 *
 * Two sanitization modes are provided:
 *  - stripToPlainText: for fields that should NEVER contain HTML at
 *    all (chat messages, mood notes, study notes, names, etc). All
 *    tags are removed; the text itself is preserved.
 *  - sanitizeRichText: for the rare case where limited, safe HTML is
 *    allowed (e.g. AI-generated markdown-to-HTML). Uses an allowlist
 *    of harmless formatting tags only — no scripts, no event handlers,
 *    no iframes, no inline styles.
 */

import sanitizeHtml from "sanitize-html";

/** Strip ALL HTML/script content, returning safe plain text only. */
export function stripToPlainText(input: string): string {
  const withoutTags = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
  // sanitize-html decodes entities back to text which is what we want
  // for storage; output encoding happens again at render time.
  return withoutTags.trim();
}

/**
 * Sanitize a constrained set of "rich text" tags for content such as
 * AI responses that may include basic Markdown-derived formatting.
 * Anything not on the allowlist (scripts, event handlers, iframes,
 * object/embed, style attributes, javascript: URLs, etc.) is removed.
 */
export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "code", "pre", "blockquote"],
    allowedAttributes: {},
    allowedSchemes: [], // no links/images allowed in this constrained context
    disallowedTagsMode: "discard",
  });
}

/**
 * Detects whether a raw input contains markup/script patterns commonly
 * used in XSS payloads. Used only for the Security Center demo to give
 * the user clear, honest feedback about what was neutralized — it is
 * NOT itself the security boundary (sanitization above is).
 */
export function containsMarkupPatterns(input: string): boolean {
  const patterns = [/<\s*script/i, /on\w+\s*=/i, /<\s*img/i, /<\s*svg/i, /<\s*iframe/i, /javascript:/i, /<\s*[a-z]/i];
  return patterns.some((p) => p.test(input));
}
