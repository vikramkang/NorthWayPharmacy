# Architecture — NorthWay Clinic and Pharmacy Website

## 1. Repo layout (monorepo)

```
northway-clinic-pharmacy/
├── ProjectDocs/        this folder — PRD, architecture, phase plan, rules, memory
├── frontend/           static site: plain HTML/CSS/JS, generated from build-site.js
│   ├── build-site.js   source of truth — edit this, not the generated HTML, for anything reused across pages
│   ├── assets/
│   │   ├── css/style.css
│   │   └── js/{main.js, config.js}
│   ├── en/*.html       generated
│   └── fr/*.html       generated
└── backend/            minimal Node/Express API
    ├── src/server.js   POST /api/register, GET /api/health
    ├── data/           local submissions store (gitignored)
    └── .env.example
```

Why monorepo instead of two separate repos: this is a solo-maintained project
right now, the backend is small (one real endpoint), and most static hosts
(Netlify, Vercel, Render) can deploy a subfolder of a monorepo as its own
service — so this doesn't lock out separate deployment later. Splitting a
monorepo into two repos later is easy; merging two repos back together is
not. If a second developer or a genuinely separate backend team joins, revisit
this.

## 2. Frontend

Plain HTML/CSS/JS — no framework, no build tool required to *host* it (only
to *regenerate* it after editing `build-site.js`). Chosen because:

- The site owner (Vikramjit) is the one updating it post-launch — a
  framework/build pipeline adds maintenance burden with no real benefit at
  this scale.
- No PHI touches the frontend, so there's no reason for server-rendering or
  auth — a static file host is sufficient.

`build-site.js` renders every page from shared header/nav/footer templates
plus per-page content objects (`pagesEn` / `pagesFr`). Regenerate with:

```
cd frontend && node build-site.js
```

Both the generator and its generated output are committed — there's no CI
build step yet.

## 3. Backend

A minimal Node/Express service with exactly one job right now: receive
registration form submissions from `frontend/en/register.html` /
`fr/register.html` and get them in front of staff. It does **not** talk to
Accuro, Oscar, Medeo, or Fillware directly — see Section 5.

Endpoints:
- `POST /api/register` — validates the payload (name, gender, phone, email,
  address, registeringFor, preferredLanguage, consent), appends it to
  `backend/data/submissions.jsonl`, returns 200.
- `GET /api/health` — liveness check.

`backend/data/` is local-file storage for now — a placeholder, not a
permanent design. It exists so the form has somewhere real to go; it is not
meant to become the system of record. See "Open architecture decision" below.

## 4. Data flow (as it stands today)

```
Patient's browser
   │  fills out register.html
   ▼
POST /api/register  (backend, this repo)
   │  validates + stores locally (data/submissions.jsonl)
   ▼
Staff reviews submissions manually
   │
   ▼
Staff enters the patient into the EMR (Accuro or Oscar — TBD)
   │
   ▼
Staff sends the patient a Medeo booking link (or Medeo does automatically)
```

No step in this chain writes clinical/health data anywhere on this site's
infrastructure. The website's role ends at "get contact info to staff."

## 5. Open architecture decisions

- **How submissions actually reach staff.** Local JSONL file is a
  placeholder. Realistic options: email notification (needs SMTP/a transactional
  email provider), a lightweight staff-facing review UI, or a direct API push
  into the EMR/task queue once Accuro vs. Oscar is decided and its API/webhook
  capability is confirmed. Do not build the EMR integration until that vendor
  question is answered (see Phase.md).
- **Hosting.** Not decided. Static frontend can go anywhere (Netlify, Vercel,
  GitHub Pages, S3+CloudFront). Backend needs a host that runs Node
  continuously or as serverless functions (Render, Railway, Fly.io, or
  Vercel/Netlify functions if we fold the backend into the same platform as
  the frontend — worth reconsidering once a host is picked, since that could
  simplify this back down to a single deployable).
- **Kroll vs. Fillware.** One questionnaire answer named Fillware as the
  pharmacy system, another mentioned Kroll in the same breath. Needs
  resolving before any pharmacy-system integration (Phase 2 refill/transfer
  form) is built.

## 6. Security & compliance notes for future work

- Nothing in this repo should ever store OHIP numbers, medication names, or
  diagnoses. If a future feature seems to require that, stop and flag it —
  that changes the entire hosting/compliance posture (see Rules.md).
- `.env` files are never committed. `backend/data/*.jsonl` is gitignored —
  it's local dev/staging data, not something that belongs in version control.
- CORS is currently permissive (`origin: true`) for development convenience.
  Lock this down to the real frontend domain before any public deployment.
