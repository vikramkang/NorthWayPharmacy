# NorthWay Clinic and Pharmacy — Website Monorepo

Bilingual (EN/FR) website + registration API for NorthWay Clinic and
Pharmacy, Cornwall, Ontario.

**Start here:** [`ProjectDocs/`](./ProjectDocs) — PRD, architecture, phase
plan, project rules, and running memory. Read those before making changes;
this README is just the quickstart.

## Structure

```
frontend/    static HTML/CSS/JS site (no build step to host, only to regenerate)
backend/     minimal Express API — receives registration form submissions
ProjectDocs/ PRD.md, Architecture.md, Phase.md, Rules.md, memory.md
```

Why one repo instead of two: see `ProjectDocs/Architecture.md` §1.

## Quickstart

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev              # http://localhost:4000

# Frontend (separate terminal) — serve the static files so fetch() to the
# backend behaves like a real browser session, not a file:// page
cd frontend
python3 -m http.server 8080
# visit http://localhost:8080/en/index.html
```

If you edit `frontend/build-site.js`, regenerate the HTML with
`node build-site.js` from inside `frontend/` before committing.

## Current status

Phase 1 (target: November 2026) is in progress. See
`ProjectDocs/Phase.md` for the live status table and the open decisions
blocking Phase 2.

## The one rule that matters most

No health information — OHIP numbers, medications, diagnoses — is ever
collected or stored by this website or its backend. See
`ProjectDocs/Rules.md` §1 before adding any new form field.
