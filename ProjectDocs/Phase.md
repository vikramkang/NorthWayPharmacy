# Phase Plan — NorthWay Clinic and Pharmacy Website

Status as of 2026-08-30. Update the status column as work lands — this file
is the single source of truth for "what's done vs. not."

## Phase 1 — Launch target: November 2026

| Item | Status | Notes |
|---|---|---|
| Sitemap + page copy (EN) | Done | 10 pages |
| French translation | Done (draft) | Needs a native/professional health-sector review before launch — not certified |
| Shared design system (CSS) | Done | Warm/teal, large type, mobile-first |
| Static site generator (`build-site.js`) | Done | Regenerate after any content edit |
| Registration form — front end | Done | Client-side validation only until backend is wired up |
| Registration form — backend endpoint | In progress | `POST /api/register`, local JSONL store as placeholder |
| Monorepo + git | In progress | `frontend/` + `backend/` under one repo |
| Real address/phone/email | Not started | Currently bracketed placeholders |
| Medeo booking link | Not started | Placeholder `#` link on Book an Appointment page |
| Provider bios/photos | Not started | Placeholder cards on About + Clinic Services |
| Logo / final brand colours | Not started | Text wordmark only |
| Privacy Policy sign-off | Not started | Drafted, needs compliance officer review |
| Hosting decision (frontend + backend) | Not started | See Architecture.md §5 |
| Submission → staff workflow | Not started (placeholder only) | Depends on EMR choice |

## Phase 2 — After launch, no fixed date

Each item below is intentionally *not* being built yet because it depends on
an answer we don't have. Don't start the code until the "depends on" column
is resolved — building ahead of the vendor answer here is the fastest way to
end up rebuilding it.

| Feature | Depends on |
|---|---|
| Prescription refill/transfer request form | Confirming with Fillware (and resolving the Fillware-vs-Kroll question) whether an online form can carry medication/prescription details without turning the site into a system that stores health information |
| Online payments (sick notes, forms, uninsured services, retail) | Choosing a PCI-compliant payment processor; budget sign-off |
| Delivery details (radius, fees, controlled-substance signature handling) | Business decision, not technical — needs owner input |
| Blog / health tips | Someone assigned to write monthly content |
| AODA / WCAG 2.0 AA accessibility pass | Not blocked technically — just needs to be scheduled; recommended given the older patient demographic and bilingual requirement even though it wasn't flagged as urgent |
| EMR-integrated staff workflow (replacing the local JSONL placeholder) | Accuro vs. Oscar decision |

## Open decisions blocking things (carried over from the discovery scope doc)

1. **Budget range** — not set; launch date (Nov 2026) is fixed regardless.
2. **EMR: Accuro or Oscar** — blocks the real staff-workflow integration.
3. **Fillware vs. Kroll** — blocks the refill/transfer form.
4. **Real Medeo booking URL.**
5. **Akwesasne / NIHB insurance handling** — affects Pharmacy Services and
   Register page copy accuracy.
6. **Backup/incident-response ownership** — likely sits with
   Medeo/Accuro/Oscar/Fillware rather than this site, but not confirmed in
   writing with any vendor yet.

## Working agile — how to use this file

We're deliberately not waiting for every answer above before building.
Ship what's unblocked, flag what isn't, and come back to this file each time
a decision lands. Update the status table rather than trusting memory of
"where things are" — that's what `memory.md` in this folder is also for.
