# PRD — NorthWay Clinic and Pharmacy Website

## 1. What this is

A bilingual (EN/FR) marketing + patient-registration website for NorthWay Clinic
and Pharmacy in Cornwall, Ontario — one brand covering two legal entities (a
clinic and a pharmacy). The site does not store any patient health information;
it captures basic contact details for registration and links out to Medeo for
appointment booking.

## 2. Business goals

- Acquire new patients and reduce inbound phone volume (in that priority order).
- Reach ~2,500 patients and ~100 prescriptions/day within 12 months of launch.
- Support the clinic (family physician, walk-in/urgent care) and the pharmacy
  (retail dispensing, long-term care supply, vaccinations, blister/compliance
  packaging) as one combined experience.

## 3. Target patients

Primary segments: long-term care residents, patients with chronic disease,
mental health patients. Secondary: general walk-in/family patients, Akwesasne
residents (insurance handling TBD — see Rules.md), an older demographic
generally (drives the accessibility-first design).

## 4. Locked product decisions

These came out of the discovery questionnaire and should not be re-litigated
without a real reason:

- **No PHI is ever stored on the website.** Registration collects name,
  gender, phone, email, address only. Clinical data lives in the EMR
  (Accuro or Oscar — not yet finalized).
- Appointment booking happens through **Medeo** (link-out, not embedded).
- Pharmacy system is **Fillware** (one mention of "Kroll" in the discovery
  answers is unresolved — confirm before building anything that assumes one
  or the other, see Phase.md).
- Full bilingual site (English/French), not just key pages.
- Telehealth is permanently out of scope. A patient login portal is not
  needed at this time.
- Target launch: **November 2026.**

## 5. Feature scope

### Phase 1 (current)
Home, Register, Book an Appointment (Medeo link-out), Clinic Services,
Pharmacy Services, Long-Term Care & Retirement Homes, Visit Us, Urgent Care
Guidance, About, Privacy Policy. Registration form posts to a small backend
endpoint for staff review (no PHI, no EMR integration).

### Phase 2 (not started)
Prescription refill/transfer requests, online payments (sick notes, forms,
uninsured services, retail), delivery details, blog/health content, an
accessibility (WCAG 2.0 AA) pass. Each is gated on an open decision — see
Phase.md.

## 6. Explicitly out of scope for v1

Telehealth, patient login/portal, online payments, prescription refill forms,
delivery logistics. Do not build these speculatively — they depend on
vendor confirmations that haven't happened yet.

## 7. Success metrics

- New patient registrations per month (target trending toward 2,500 patients
  in 12 months).
- Reduction in inbound call volume for routine registration/booking.
- Time-to-registration-confirmation (staff review turnaround).

## 8. Key open questions

See `Phase.md` for the full list with owners. The two that block the most
downstream work: final budget range, and which EMR (Accuro vs. Oscar) the
clinic commits to.
