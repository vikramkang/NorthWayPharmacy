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

## 2. Content rules

- Every page ships in English **and** French — never add an English-only
  page without also adding (or clearly stub-marking) the French version.
- Placeholders use the format `[LIKE THIS]` in English and `[COMME ÇA]` in
  French — grep-able, and obviously not real content if accidentally shipped.
- Tone is warm and community-oriented, not clinical/corporate — see PRD.md.
- French content is a working translation, not a certified one. Flag this
  wherever French copy changes; don't let it quietly become "final" without
  a real review pass.

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
