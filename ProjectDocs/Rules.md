# Rules — NorthWay Clinic and Pharmacy Website

Guardrails for anyone (human or AI) working on this repo. When in doubt,
these rules win over convenience or speed.

## 1. Data & compliance rules (non-negotiable)

- **Never add a field, form, or page that collects health information** —
  no OHIP numbers, no medication names, no diagnoses, no symptoms — to the
  website's own front end or database. This was an explicit, deliberate
  decision (see PRD.md §4), made specifically to keep the website out of
  PHIPA/data-residency/hosting complexity. If a feature request seems to
  require it (e.g. a "smarter" refill form that lists medications), stop and
  raise it — don't quietly build it.
- Registration data (name, gender, phone, email, address) is contact
  information, not health information, and is treated as sensitive-but-not-PHI:
  don't log it to third-party analytics, don't put it in URLs/query strings,
  don't email it over unencrypted channels without checking first.
- Any refill/transfer request feature (Phase 2) must be re-reviewed against
  this rule specifically, because a refill form naturally wants to carry
  medication/prescription details — resolve with the pharmacy vendor before
  writing code, not after.
- The Privacy Policy page is a draft until NorthWay's compliance officer signs
  off. Do not treat its current text as final or launch-ready.

## 1a. Team roster / identity rules

- Never put a real clinician's name, photo, credentials, or bio on the
  public Team page without their explicit knowledge and consent.
- Never copy a name, photo, or bio from another practice's real website —
  even as a placeholder. It happened once already (a request to reuse
  maplecures.ca's real physicians as placeholder content) and was declined;
  see memory.md. Use clearly generic, fictional placeholder entries instead
  until real ones are provided.
- Stock or third-party photography needs the user's explicit go-ahead before
  downloading (see the app's own permission rules on file downloads) and
  clean licensing. Default to the initials-avatar placeholder rather than
  sourcing photos without asking.
- The decorative photos sitewide (hero + Clinic/Pharmacy/Long-Term Care/About
  pages) are the client's own supplied stock photos, dropped into `frontend/`
  and now optimized (resized, compressed, metadata stripped) into
  `frontend/assets/img/`. The untouched originals are kept in
  `frontend/assets/img/_source/` in case a different crop/size is needed
  later. An earlier pass had used hotlinked free Pexels photos instead — the
  client felt those looked low-quality and replaced them with these real
  ones; see memory.md. None of them show a real, named NorthWay clinician —
  see the rule above about the Team page specifically.
- The Team admin page (`frontend/admin/team.html`) is gated by a single
  shared `ADMIN_TOKEN`, not per-user accounts. Don't describe it to the
  client as "secure" without that caveat, and don't extend it to handle
  anything more sensitive than public marketing bios without adding real
  authentication first.

## 2. Content rules

- **Keep it short.** Ledes are a handful of words (aim for under 8), not
  sentences. One short sentence per card. If a page needs a second sentence
  to explain itself, cut the first one instead of adding a second. This was
  flagged twice by the user — treat it as a hard rule, not a style
  preference.
- **Fewer top-level nav items, not more.** Nav: Walk-Ins, Clinic Services,
  Meet the Team, Careers, Policies, About Us, plus the "Book an Appointment" CTA (no
  "Home" tab — the logo goes home). The business is **clinic only for now**;
  Pharmacy pages are kept in source but hidden behind `SHOW_PHARMACY = false`
  at the top of `build-site.js` (set `true` + rebuild to restore; review the
  clinic-only hero/trust-strip wording when you do). Urgent-care guidance lives
  on Walk-Ins (`#urgent-care`); Hours/Location/Contact are `#visit-us` on About
  Us. Retired URLs (`register`, `urgent-care`, `long-term-care`,
  `pharmacy-services`, `visit-us`) are one-line meta-refresh redirects via
  `RETIRED_REDIRECTS`. Ask whether a new page can be a section of an existing
  one before adding another nav item. (Hamburger menu kicks in below 1040px.)
- **Policies page** (`policies.html`): Late Cancellation & No-Show (fee in
  `NO_SHOW_FEE`, currently $80 / 24h notice, taken from the client's other site
  maplecures.ca — **confirm for NorthWay**) and Respectful Environment (generic
  draft wording, needs client approval). A Prescription Refill policy is not
  included while pharmacy is hidden.
- **Hours:** Mon–Sat 12:00 pm – 8:00 pm, Sunday closed. Hours appear in the
  footer, home strip, and About Us table (EN + FR) — change all together.
- **Internal/engineering notes are HTML comments, never on-page boxes.**
  Anything meant for a future developer or for compliance review ("this is a
  placeholder," "pending sign-off," "coming soon") goes in a `<!-- -->`
  comment in `build-site.js`, not a visible callout on the live page. A
  patient should never see the word "draft," "TODO," or a bracketed
  `[STATUS]` flag. Keep each page to at most one visible callout box —
  more than that reads as cluttered, not helpful.

- Every page ships in English **and** French — never add an English-only
  page without also adding (or clearly stub-marking) the French version.
- Placeholders use the format `[LIKE THIS]` in English and `[COMME ÇA]` in
  French — grep-able, and obviously not real content if accidentally shipped.
- Tone is warm and community-oriented, not clinical/corporate — see PRD.md.
- French content is a working translation, not a certified one. Flag this
  wherever French copy changes; don't let it quietly become "final" without
  a real review pass.

## 2a-i. Branding

- The brand name on the site is **NorthWay Clinics** (matches the logo);
  descriptive copy like "Family Clinic and Pharmacy" stays where it describes services.

- The logo is the client's official **NorthWay Clinics** logo
  (`frontend/assets/img/logo.svg`, a vector redraw of the supplied low-res
  raster using Montserrat outlined to paths; the original raster is kept in
  `assets/img/_source/NorthWay-Clinics-logo.jpeg`, and `logo.png` is an older
  trimmed copy of it).
  It's rendered via `LOGO_IMG()` in `build-site.js` (header + 404). Swap in the
  official vector file if the client has one. The favicon is a simple
  navy/purple "N" derived from the brand colors, not an official mark.
- Real phone/address/email are still unknown — bracketed placeholders
  (`[PHONE NUMBER]`, etc.) stay until the client provides them. Don't
  invent plausible-looking values.

## 2a-ii. Icon set

- Every icon-badge/trust-strip icon is a small hand-drawn inline SVG line
  icon, defined once in the `ICONS` object in `build-site.js` and reused by
  key (`ICONS.stethoscope`, `ICONS.pill`, etc.) — not emoji. Emoji render
  inconsistently across platforms (mismatched colors/styles per OS), which
  is why they were replaced. If a new icon is needed, add it to `ICONS`
  in the same style (24x24 viewBox, stroke="currentColor", stroke-width
  ~1.6-1.7) rather than reaching for an emoji or a new one-off pattern.

## 2a. Visual design & animation rules

- Palette comes from the logo: primary accent is purple (`--accent #662B85`),
  navy (`--accent-dark #0E1F5A`) for headings/hover, secondary accent is a
  mid blue (`--accent2 #2F4BA0`), on a cool off-white background (`--bg
  #F8F7FB`). Don't introduce a third accent color —
  alternate between the two on icon badges/cards instead.
- Headings use Poppins (Google Fonts); body text stays on the system font
  stack for load performance. Don't add more web fonts without a reason.
- **No infinite or auto-playing animation, with one exception** — the client-requested
  no-show notice ribbon (scrolling text under the top bar), which has a visible
  Pause/Play button, pauses on hover/focus, and is static under
  `prefers-reduced-motion` (WCAG 2.2.2). Nothing else may loop. Hover/focus
  micro-interactions (card lift, button shadow, nav underline) and one-time
  entrance effects (scroll-reveal, sticky-header shadow) are fine. A pulsing
  badge, a looping decorative shape, or anything that moves without the user
  triggering it is not — this is a deliberate WCAG 2.2.2 (pause/stop/hide)
  and older-patient-demographic decision, not an oversight.
- Every animated/transitioned rule must have a `@media
  (prefers-reduced-motion: reduce)` fallback that disables it — see
  `style.css`'s bottom block and `main.js`'s `prefersReducedMotion` check.
  When adding new motion, extend both, don't just add the effect.

## 2b. Temporary demo hosting (GitHub Pages)

- The site is temporarily deployed to GitHub Pages for client-demo purposes
  (see Architecture.md §5 and memory.md) at a throwaway `github.io` URL —
  not the real launch domain. While that's true:
  - Every page carries `<meta name="robots" content="noindex, nofollow">`
    and `frontend/robots.txt` disallows all crawling, so the demo URL
    never competes with the real domain in search results.
  - `SITE_ORIGIN` in `build-site.js` is hardcoded to the demo GitHub Pages
    URL, used only for absolute `og:image`/`og:url` tags (so the link looks
    right when the demo is shared). Update it (or blank it to `""` for
    relative paths) once a real domain is chosen for launch, and remove
    the noindex meta tag / robots.txt block at the same time.
  - `frontend/404.html` is bilingual and hand-written (not run through
    `layout()`, since it lives at the site root, not under `en/`/`fr/`).

## 3. Engineering rules

- Edit `frontend/build-site.js`, not the generated HTML files directly, for
  anything that should apply across pages (nav, footer, layout). Run
  `node build-site.js` from inside `frontend/` after any change and commit
  the regenerated output alongside the source change.
- `.env` files are never committed (see `.gitignore`). Copy `.env.example` to
  `.env` locally and fill in real values.
- `backend/data/*.jsonl` is local placeholder storage, gitignored. Don't
  treat it as a database to build features against — it's there so the
  registration form has *somewhere* to go pending the real EMR-integration
  decision.
- Don't add a new third-party script/tracker to any frontend page without
  checking it against the "no tracking on pages that could touch health
  context" stance from the discovery answers — when in doubt, keep analytics
  off entirely rather than scope it down page-by-page.
- CORS on the backend is permissive (`origin: true`) for development. Anyone
  deploying this publicly must lock it to the real frontend origin first.

## 4. Process rules

- Before starting Phase 2 work on any item, check `Phase.md` — if it lists an
  unresolved "depends on," resolve that first (or explicitly flag that you're
  building ahead of it, and why).
- Log meaningful decisions and session context in `memory.md` as you go —
  future sessions (AI or human) should be able to read `ProjectDocs/` and
  understand the current state without re-deriving it from git history.
- This project is being run agile/iteratively on purpose — many discovery
  questions were answered "don't know yet." That's fine. Don't let it become
  an excuse to guess at compliance-sensitive decisions (Rule set 1 above)
  instead of asking.
