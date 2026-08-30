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

## Next things likely to happen

- Finish the backend registration endpoint + wire the frontend form to it.
- `git init` + first commit of the monorepo.
- Decide on a git remote (GitHub?) and hosting for frontend/backend.
- Come back to the Phase.md open-decisions list as answers arrive.
