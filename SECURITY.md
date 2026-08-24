# SECURITY.md — CalmCampus AI

## Primary security technique

**Cross-Site Scripting (XSS) Prevention.**

## Threat model

CalmCampus AI accepts free-form text from students in several places: AI chat messages, mood notes, study
notes, and profile fields. If any of this content were rendered as HTML without treatment, an attacker
(or a compromised/malicious input) could inject a `<script>` tag or an event-handler attribute (e.g.
`onerror`, `onload`) that executes in another user's browser — stealing session data, impersonating the
user, or defacing the app. This is Cross-Site Scripting (XSS).

## Attack surface

- Chat messages (student → AI, AI → student)
- Mood notes
- Study notes / planner task text
- Profile fields (name, course, year, study preferences)
- AI-generated content (also treated as untrusted before storage/render)

## Mitigation — defense in depth

CalmCampus AI never trusts user-controlled text to be safe markup. Every piece of user content passes
through the same pipeline before it is stored or shown to anyone:

```
User Input → Validation → Sanitization → Safe Rendering → Protected Application
```

1. **Input validation (server-side, Zod)** — every request body is validated against a strict schema
   (`backend/src/validators/schemas.ts`) before any handler logic runs: type, length limits (e.g. chat
   messages capped at 1000 characters), and format (e.g. valid email). Malformed requests are rejected
   with `400` before touching the database.

2. **Sanitization (server-side, `sanitize-html`)** — `backend/src/utils/sanitize.ts` strips all HTML tags
   from plain-text fields (chat messages, mood/study notes, names) before they are stored. A separate,
   tightly allow-listed `sanitizeRichText` function exists for the rare case of limited formatting, and
   still blocks scripts, event handlers, `javascript:` URLs, iframes, and inline styles.

3. **Safe rendering (client-side, React)** — the frontend renders all user content through ordinary JSX
   text interpolation (`{content}`), which React escapes automatically. `dangerouslySetInnerHTML` is never
   used for chat messages, notes, or any user-controlled field anywhere in the app. Where rich HTML is
   ever unavoidable in the future, it must be passed through DOMPurify first.

4. **Security headers (Helmet + CSP)** — `backend/src/server.ts` sets a Content-Security-Policy that
   restricts script sources to `'self'` (no inline scripts, no third-party script origins), disables
   framing (`frameAncestors: 'none'`), and sets other standard hardening headers.

5. **Output is never trusted twice** — even AI-generated responses are sanitized before storage, since a
   future real AI provider could itself echo back attacker-supplied text.

## Demonstration

1. Open **Privacy** (`/privacy`) and find "How your content is protected."
2. Click **See it in action** to expand the live demo.
3. Enter: `<script>alert('XSS')</script>`
4. Click **Run Test**.
5. Observe: the payload is not executed. The response shows it was safely neutralized and displays the
   tag-stripped text.
6. The same protection applies live in the AI Chat, Mood Check-in, and Study Planner — try pasting the
   same payload into any of those fields and it will be stored and displayed as inert text.

## Other implemented controls (supporting, not primary)

- Passwords hashed with bcrypt (cost factor 12), never stored or logged in plain text.
- Sessions via signed JWT in an `httpOnly`, `sameSite=lax` cookie — not accessible to JavaScript, which
  also limits the impact of any residual XSS.
- IDOR prevention: every conversation/mood/task lookup checks `resource.userId === req.userId`.
- CORS restricted to the configured frontend origin only (never `*`) with credentials enabled.
- Generic error responses to clients; full error detail logged server-side only, never a stack trace or
  DB error sent to the browser.
