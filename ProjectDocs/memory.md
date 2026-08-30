# Project Memory — NorthWay Clinic and Pharmacy Website

A running log of decisions and context. Read this first when picking the
project back up — it's the "what happened and why" that git history alone
won't tell you.

## Timeline so far

**2026-07-24 — Discovery.** Put together a business-questionnaire covering
scope, regulatory/compliance, systems/integrations, patient intake,
appointments, Cornwall market specifics, content/brand, ops/budget, and risk.
Delivered as a Word doc with space to answer.

**2026-07-27 — Answers came back.** Key facts that shaped everything after:
- One brand, two legal entities: **NorthWay Clinic and Pharmacy**.
- Services: family physician + walk-in/urgent care; retail dispensing, LTC
  supply, vaccinations, blister/compliance packaging.
- Target: 2,500 patients and 100 Rx/day within 12 months. Priority: acquire
  new patients, then reduce phone volume.
- Pharmacy system: **Fillware** (one later answer also mentioned Kroll —
  unresolved, see Phase.md).
- EMR: **Accuro or Oscar**, not finalized.
- Booking: **Medeo**, link-out only.
- Full bilingual site required.
- Launch target: **November 2026**, budget not yet set.
- Turned this into a Scope/Sitemap/Phased-Plan doc, flagging two
  contradictions: (1) "no PHI on the site" vs. wanting an online
  refill/transfer form, and (2) Fillware vs. Kroll as the pharmacy system.

**2026-08-30 — Contradiction resolved; build started.** User clarified: *no
patient data is saved on the website in any form; registration is a simple
contact-capture step, and the site will connect to Accuro (or another EMR
service) rather than store anything itself.* That resolves concern #1 above —
the refill-form tension only re-emerges if/when Phase 2 refill forms are
actually built, so it's noted in Rules.md as something to re-check at that
point, not something blocking Phase 1.

User said to stop trying to get every question answered up front and start
building, agile-style. Built:
- Phase 1 static site (EN/FR, 10 pages), verified structurally (no broken
  links, all form fields labeled, language toggle resolves both ways).
- Delivered as a zip + README while working out of a temporary session
  workspace (no project folder connected yet).

Then the user asked to set up a real project: connected
`E:\PersonelProjects`, created `northway-clinic-pharmacy/` as the project
root, decided on a **monorepo** (`frontend/` + `backend/`) over separate
repos — reasoning in Architecture.md §1. Started scaffolding `backend/` (a
minimal Express API for the registration form — the one real piece of
Phase 1 backend work flagged in the original site README). Mid-build, user
asked for this `ProjectDocs/` folder with five files
(Architecture/memory/Phase/PRD/Rules) mirroring a project structure they'd
used before. Checked for a saved skill matching that pattern — none found —
so these were authored directly from project context.

## Things to remember that aren't written anywhere else

- The discovery-questionnaire doc and the scope/sitemap/phased-plan doc were
  both delivered as Word files during an earlier session that had no project
  folder connected — they're not in this repo. Worth pulling their content in
  here (or at least re-confirming it still matches PRD.md/Phase.md) if they
  get updated independently.
- "Agile, can't answer everything now" is the operating mode the user
  explicitly asked for — don't block progress waiting on the open questions
  in Phase.md, but don't paper over the compliance-sensitive ones either
  (Rules.md §1 exists specifically to hold that line).
- Decision-maker / sign-off: Guriqbal Singh (from the original discovery
  answers).

**2026-08-30 (later) — Simplified for patients.** User pointed out the site
looked "complicated" and exposed internal complexity — draft/placeholder
boxes ("Coming soon", "Draft — pending compliance review", "[STATUS]") were
visible directly on live pages, and copy read like an internal spec doc
(explaining EMR/backend mechanics to patients). Rewrote `build-site.js`
content: moved every internal/engineering note into HTML comments (visible
in source, invisible on the page), cut each page down to at most one visible
callout box, replaced clinical/process-y copy with short warm sentences, and
replaced bracket status flags (`[STATUS]`) with plain confident copy. Rule
of thumb going forward, now also in Rules.md: **internal notes are HTML
comments, never on-page boxes.** Regenerated and re-verified — 0 structural
errors, 0 leftover "draft"/"coming soon" strings on any page.

**2026-08-30 (later still) — Design research + Team feature.** User said the
site still felt "complicated" even after the copy simplification pass and
asked for real research before touching it again. Researched: a curated
roundup of 27 small/independent clinic sites (2026), a guide written
specifically for independent pharmacy websites (patterns drawn from real
client rebuilds), and general healthcare-UX principles. Also reviewed
TejoMed (small family-medicine practice) and, per the user's own reference,
**maplecures.ca** — a near-identical business model (clinic + pharmacy,
Ottawa) — directly.

Key takeaways applied: name the audience/service/geography in the hero
instead of generic copy; lead with a few plain-language service cards, not
a wall of boxes; real photography (or, lacking that, initials-avatar
placeholders) does the trust-building work that bordered callout boxes
can't; a distinct pill-style CTA button for the primary action (booking)
stands out from the rest of the nav; two colors plus ink/canvas is enough.

**Important line drawn:** the user's request said to "add the same doctors"
as maplecures.ca. Declined that specifically — Dr. Ahuchogu and Dr. Bashorun
are real, licensed physicians at a real, unrelated clinic; reusing their
names/photos/bios on NorthWay's site would be identity misuse, not a
reasonable placeholder. Matched maplecures.ca's *structure* instead (photo-
or-initials-avatar, name, role badge, short bio, accepting-patients pill)
with clearly generic seed names (Dr. Sarah Bennett, Dr. Michael Tran, Aisha
Malik). Same reasoning applied to stock photography — rather than
downloading third-party photos (needs explicit permission, plus licensing
questions), used CSS-based avatar placeholders sized so real photos drop in
later with a one-line change (just set `photoUrl`).

**New feature, explicitly requested:** the user wants team-member management
"handled by the admin side," not by editing code. Built:
- `backend/data/team.json` + `backend/src/team-store.js` — simple JSON store.
- `GET /api/team` (public, used by the live Team page) and
  `POST` / `PUT /:id` / `DELETE /:id` (gated by a shared `ADMIN_TOKEN` header
  — one shared secret, not per-user accounts; see Architecture.md and
  Rules.md for the explicit scope limits of this).
- `frontend/admin/team.html` — a plain, unlinked internal page to add/edit/
  delete team members. Not discoverable from the public nav.
- `frontend/en|fr/team.html` — fetches `/api/team` client-side and renders
  it, so an admin edit shows up without regenerating the static site.
- Added "Our Team" to the main nav (safe to insert at the end — footer links
  reference nav entries by array index, so anything inserted earlier would
  have silently broken them; worth remembering if nav order changes again).

Verified: 24 HTML files, 0 structural errors; full endpoint test (public
GET, 401 with no/wrong token, 201 with correct token); combined smoke test
serving the frontend + backend together confirmed team.html loads, calls
the right API, and the admin page is reachable.

**2026-08-30 (even later) — Cut it down further.** Even after the research-
driven redesign, the user pushed back again: too much text, headings too
long, and Register didn't need to be its own nav item. Merged Register into
the Book an Appointment page as a "New Patient" section (with "Returning
Patient" / Medeo below it) and dropped it from the nav — 9 items down to 8.
Rewrote every lede to under 8 words and cut nearly every remaining sentence
sitewide (card text, hints, callouts). `register.html` is now kept as a
one-line redirect to `book-appointment.html` in both languages, so nothing
that already linked to it breaks. Footer quick-links now look up labels by
href instead of a fixed array index (`navLabel()` helper) — the old
index-based approach broke once already when nav items were removed and
would have again.

Lesson for next time: when the user says "look at other sites and make it
simple," the deliverable they want back is a *shorter site*, not a better-
researched one that's the same length. Research informs what to cut, not
what to add.

**2026-08-30 (latest) — Visual polish pass.** User's take after the content
cut-down: "still looks too basic, use some animations, some attractions, some
nice colors... you decide." Kept every wording/structure decision from the
previous pass (short ledes, 8-item nav, etc.) and added a purely visual/
interactive layer:
- New palette — deeper teal `--accent` plus a new warm amber `--accent2`,
  alternated across icon badges for rhythm; warmer cream `--bg`; Poppins
  (Google Fonts) for headings only.
- Every card sitewide now has a colored circular icon badge (previously only
  the four home-page cards had plain emoji; Clinic/Pharmacy/Long-Term
  Care/Visit Us/Urgent Care cards had none).
- Static (non-animated) decorative gradient blobs behind `.hero` and
  `.page-header` — visual interest without motion.
- Hover/focus micro-interactions on cards, buttons, and nav links; a
  sticky-header scroll shadow; one-time scroll-reveal on every major section
  (`main.js`, IntersectionObserver).
- Deliberately did **not** add anything that loops or auto-plays (no pulsing
  badges, no floating shapes) — reasoned through WCAG 2.2.2 and the older
  patient demographic; documented as a hard rule in Rules.md §2a, including
  the required `prefers-reduced-motion` fallback pattern in both the CSS and
  `main.js`.
- Regenerated (23 HTML files) and re-ran the jsdom structural verifier: 0
  errors, 0 warnings. Also grep-checked: 0 leftover old `card-icon` spans, all
  card pages have `icon-badge`, all major sections carry `reveal`, both CSS
  and JS reduced-motion guards present.

No real browser was available to take actual screenshots (Puppeteer's Chrome
download is blocked in this sandbox — see the note further down); relied on
structural/text verification the same way as previous passes.

**2026-08-30 (even later) — Cut redundant subtext, made home tiles clickable.**
User flagged that the home hero lede and the four "What we offer" card
descriptions added zero new information — each one just restated its own
heading in different words. Removed them rather than rewording (heroSection's
`lede` and card()'s `text` are now optional and simply omitted when not
given). Also made the service tiles do double duty as navigation: Family &
Walk-In Clinic, Pharmacy Services, and Long-Term Care Support cards now link
to their respective pages (`card()` takes an optional `href` and renders an
`<a class="card">` instead of a `<div class="card">`); Bilingual Service has
no dedicated page so it stays a plain, non-linked card. Re-verified: 0
structural errors.

Lesson: a lede/subtext is only earning its place if it tells the reader
something the heading didn't already say — otherwise cut it, don't rephrase
it.

**2026-08-30 (latest) — Banner made admin-controlled.** User asked whether
the "Accepting new patients" top banner could be switched from the backend
— it couldn't; it was a hardcoded string in `build-site.js`, baked in at
generate time. Asked the user, and they wanted it admin-controlled (same
pattern as the Team roster). Built:
- `backend/data/site-settings.json` + `backend/src/settings-store.js` — a
  single JSON object (not a list), currently just `{ banner: { enabled,
  textEn, textFr } }`.
- `GET /api/settings` (public) and `PUT /api/settings` (same `ADMIN_TOKEN`
  gate as `/api/team`).
- `main.js` fetches `/api/settings` on every page load and updates the
  banner text/visibility; the string `build-site.js` bakes into the HTML is
  now only a no-JS/backend-down fallback, not the real source of truth.
- Added a "Site banner" section directly to the existing
  `frontend/admin/team.html` (enabled toggle + EN/FR text + Save) rather than
  building a separate admin page for one on/off and two text fields.

Tested end-to-end: public GET returns defaults, PUT without/with-wrong token
returns 401, PUT with the correct token updates and persists, invalid types
return 400. Regenerated the site and re-ran the jsdom verifier — 0 errors.

**2026-08-30 (latest) — Added stock photography.** User pointed out the site
had no photos at all and asked for clinic/pharmacy-relevant stock images.
Sourced free, no-attribution-required photos from Pexels (pexels.com/license)
and added them to the home hero (two-column layout, text + photo) and as a
banner image under the page header on Clinic Services, Pharmacy Services,
Long-Term Care, and About. Deliberately did *not* add a photo to the Team
page — that page already has an explicit rule (see §1a above) against
attaching stock photography to specific named team members; a generic decor
photo elsewhere on the site doesn't have that problem since it's not claiming
to depict anyone specific.

Photos used (all Pexels, free license, no attribution required):
- Home hero: photo 33812025 — clinic reception area.
- Clinic Services: photo 38618421 — doctor in a white coat with a stethoscope.
- Pharmacy Services: photo 14797857 — pharmacist assisting a customer at the
  counter.
- Long-Term Care: photo 7551609 — caregiver and senior sharing a warm moment
  (picked deliberately over several sadder/more clinical wheelchair-and-
  hospital-corridor options in the same search, to keep the tone warm rather
  than somber for an older-patient-facing page).
- About: photo 39192403 — doctor consulting with a parent and child.

Technical note: these are hotlinked directly from Pexels' `images.pexels.com`
CDN, not downloaded and self-hosted. The sandbox this site is built in can
only reach the npm registry over the network — `curl` to `images.pexels.com`
returns a 403 from the sandbox's proxy. Confirmed via the in-app browser
(which has broader network access) that all 5 URLs resolve with HTTP 200
and a real `image/jpeg` body, so they work fine for site visitors; the
tradeoff is the site now depends on Pexels' CDN staying up, same category of
dependency as the Google Fonts import. Flagged in Rules.md §1a as something
to revisit before launch (download once, serve from
`frontend/assets/img/`).

**2026-08-30 (even later) — Replaced stock photos with the client's own.**
User said the Pexels photos looked "too bad" and offered two options: generate
images, or use photos they'd already dropped into the frontend folder. Found
5 real photos placed directly at `frontend/` root (`Reception.jpeg`,
`Consulation 2.jpeg`, `Prescription.jpeg`, `Long Term care.jpeg`,
`Vertical_introductory.jpg`) — good, on-brand shots that happened to map
one-to-one onto the 5 slots already built for the Pexels images:
- `Reception.jpeg` → home hero (staff member helping a patient at the desk).
- `Consulation 2.jpeg` → Clinic Services (doctor/patient handshake).
- `Prescription.jpeg` → Pharmacy Services (bilingual EN/FR prescription
  pickup screen — a nice coincidental fit for a bilingual site).
- `Long Term care.jpeg` → Long-Term Care (literally shows a "Long-Term Care
  Support / Soutien aux soins de longue durée" pamphlet in frame).
- `Vertical_introductory.jpg` → About (portrait-orientation stethoscope
  close-up; restructured the About page into a two-column text+photo layout
  instead of the flat photo-band the other pages use, since forcing a 6000px-
  tall portrait into a short landscape band would have cropped it badly).

Originals were 2-2.5MB each (up to 4000×6000px) — resized with ImageMagick
(`convert -resize -strip -quality 78 -sampling-factor 4:2:0`) down to 65-120KB
each, moved into `frontend/assets/img/`, with the untouched originals kept in
`frontend/assets/img/_source/` for future re-crops. `build-site.js` now
points at these local files instead of the Pexels hotlinks. Regenerated and
verified: 0 structural errors, 0 missing images, every `<img>` has alt text.

**2026-08-30 (latest) — Nav cut from 9 items to 5.** User shared a screenshot
showing the nav wrapping to two lines and asked to make it fewer. Applied the
same "fold it into an existing page as a section" pattern already used for
Register → Book an Appointment:
- Urgent Care folded into Clinic Services as an `#urgent-care` section.
- Long-Term Care folded into Pharmacy Services as a `#long-term-care`
  section (the "Long-Term Care & Retirement Homes" card on that page is now
  a link down to the section instead of plain text).
- Mid-fix, user sent a follow-up: fold Visit Us and Our Team into the About
  page too, all three as one "About Us" page. Combined About + Team +
  Visit Us into a single `about.html` with `#team` and `#visit-us` sections;
  nav label changed from "About" to "About Us" (FR: "À propos de nous") to
  reflect the wider scope.

Final nav: Home, Book an Appointment, Clinic Services, Pharmacy Services,
About Us — 5 items, fits on one line.

Every retired URL (`urgent-care.html`, `long-term-care.html`,
`visit-us.html`, `team.html`, plus the earlier `register.html`) is kept as a
one-line meta-refresh redirect to its new section, generated from a
`RETIRED_REDIRECTS` map in `writeSite()`, so nothing that already linked to
the old pages breaks. All in-site links (home page cards, the Book
Appointment "something urgent" hint, the home hero's "Meet the Team"
button) were repointed to the direct new URLs rather than left to bounce
through a redirect. Regenerated and verified: 0 structural errors, 0 broken
links, 0 missing images, exactly 5 nav items and 1 CTA link per real page.

**2026-08-30 (latest) — Prepped for a temporary GitHub Pages demo.** User
gave a GitHub repo (`https://github.com/vikramkang/NorthWayPharmacy`) and
asked to deploy temporarily for a client demo. Asked which scope they
wanted; user chose frontend-only (fastest, free), not frontend+backend.
Built:
- `.github/workflows/deploy-pages.yml` — publishes just `frontend/` to
  GitHub Pages via `actions/upload-pages-artifact` +
  `actions/deploy-pages`, triggered on push to `master`/`main` or manually.
  The backend is intentionally excluded from this deploy.
- `frontend/.nojekyll` — belt-and-suspenders against GitHub's Jekyll
  processing touching the `assets/img/_source/` folder (starts with `_`).
- Committed everything outstanding (visual polish, banner feature, client
  photos, nav consolidation) in one commit, and added `origin` pointing at
  the given repo URL.

Important limitation flagged to the user: could not push or authenticate to
GitHub myself — pushing requires the user's own git credentials, which this
assistant must never handle (per the app's credential-entry rules), so the
actual `git push` and the one-time "enable Pages" step in repo settings are
left for the user to run themselves. Also flagged: this is frontend-only,
so the registration form, Team roster, and admin banner toggle won't
function on the live demo (the frontend already degrades gracefully when
the backend is unreachable — friendly error text, not a broken page) — only
worth upgrading to a full frontend+backend demo if the client needs to see
those working live.

**2026-08-30 (latest) — "More attractive and professional" pass, plus the
GitHub Pages demo going live and needing fixes.** After the nav-cut, user
asked for suggestions to make the site look more professional. Offered:
real contact info (blocked — not finalized), a real logo/favicon (blocked —
not finalized, user said use a placeholder), a trust-signal strip, basic
SEO/social meta tags, a custom 404, and a consistent photo treatment; also
flagged that fabricated testimonials aren't something to build. User said
to proceed with a placeholder logo and continue. Then, before finishing,
user separately flagged the emoji icons looked inconsistent/low-quality and
asked for generated icons instead — handled that first since it touched the
same card-badge markup.

Deploy detour (interleaved with this work): user gave a GitHub repo
(`vikramkang/NorthWayPharmacy`) and asked to deploy temporarily for a
client demo. Committed everything, added `origin`, and — since pushing
needs the user's own git credentials, which this assistant must never
handle — asked the user to push and enable Pages themselves. Two real
issues came up and got fixed:
1. First deploy failed (404 "Ensure GitHub Pages has been enabled") because
   the repo was private — GitHub Pages needs a public repo or a paid plan.
   User made it public (confirmed safe: no `.env`/secrets are tracked).
2. Second deploy "worked" but showed the root README, not the site —
   Pages was set to "Deploy from a branch" (classic method, serves the
   whole repo root) instead of "GitHub Actions" (our workflow, which
   publishes only `frontend/`). User switched the Source setting and it
   came up correctly.

Built, in order:
- Custom icon set (`ICONS` in `build-site.js`) — 14 hand-drawn inline SVG
  line icons (stethoscope, pill, house, bilingual, cross, droplet, box,
  truck, person, clock, alarm, moon, pin, phone) replacing every emoji
  icon-badge sitewide. Colored via `currentColor` + `.icon-badge.b-accent
  /.b-accent2` text-color rules, so they tint automatically per badge.
- Placeholder logo mark (`LOGO_MARK`) — a generated rounded-square
  cross-and-dot mark in brand colors, used in the header and as
  `frontend/assets/img/favicon.svg` (+ PNG fallbacks via ImageMagick).
  Explicitly commented as a placeholder pending real branding.
- A trust-signal strip under the home hero (licensed pharmacists &
  physicians / bilingual / clinic+pharmacy in one visit / serving
  Cornwall) — deliberately did NOT repeat "accepting new patients" here
  since that's already the admin-toggleable banner; duplicating it as
  static text would drift out of sync if staff ever turn the banner off.
- Open Graph/Twitter-card meta tags for better link-preview quality when
  the demo is shared, plus a sitewide `noindex` meta tag and
  `frontend/robots.txt` disallowing all crawling — this is a throwaway
  demo domain, not the real launch domain, so it shouldn't get indexed.
- A bilingual `frontend/404.html` (GitHub Pages serves this automatically
  for unmatched URLs).
- A `.photo-frame` wrapper (brand-tinted overlay + slight saturation/
  contrast bump) applied to every real photo sitewide, so the 6 client
  photos — sourced at different times, different lighting — read as one
  consistent set instead of a loose collage.
- A 6th client-supplied photo, `CheckingBaby.jpeg` (a family physician
  checking a happy baby held by their smiling parent) — user said it felt
  like a strong "family physician" image, so it replaced the doctor/patient
  handshake photo as the Clinic Services page's lead photo. The handshake
  photo remains in `assets/img/` unused, available if needed elsewhere.

Regenerated and verified after each step: 0 structural errors, 0 missing
images throughout.

**2026-08-30 — Home hero photo crop fix.** User flagged the home hero photo
was cropped so tight the visitor/patient at the reception desk was barely
visible (just a hand). Cause: `home-reception.jpg` is a wide 1400x513
panorama, but the hero box is much closer to square (~1.6:1), so
`object-fit: cover` at the default center position cropped roughly a third
off each side — center-weighted toward the receptionist, cutting the
visitor on the right almost entirely. Fixed by adding
`.hero-media .photo-frame img { object-position: 85% center; }` in
`style.css`, shifting the crop right so both the receptionist and the
visitor are in frame (confirmed via an ImageMagick test crop before
applying). This only affects the plain `.hero-media` box (home page); the
`.hero-media--tall` box (About page) already had its own object-position
tuned separately and is unaffected.

## Next things likely to happen

- Finish the backend registration endpoint + wire the frontend form to it.
- `git init` + first commit of the monorepo.
- Decide on a git remote (GitHub?) and hosting for frontend/backend.
- Come back to the Phase.md open-decisions list as answers arrive.
