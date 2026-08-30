# NorthWay Backend

A minimal Express API with one real job: receive registration submissions
from the frontend's Register page. See `ProjectDocs/Architecture.md` in the
project root for how this fits into the bigger picture, and
`ProjectDocs/Rules.md` for what this service must never do (store health
information).

## Run it locally

```
cd backend
npm install
cp .env.example .env
npm run dev
```

Server starts on `http://localhost:4000` by default.

## Endpoints

- `GET /api/health` — liveness check.
- `POST /api/register` — body: `{ registeringFor, fullName, gender, phone, email, address, preferredLanguage, consent }`. Validates required fields, appends to `data/submissions.jsonl`, returns `201 { ok: true }` or `400 { ok: false, errors: [...] }`.
- `GET /api/register/_pending` — dev-only, returns queued submissions as JSON. Disabled unless `ENABLE_DEV_PENDING_ROUTE=true`. No auth — local convenience only, never expose this publicly.
- `GET /api/team` — public. Returns the provider roster shown on the live Team page.
- `POST /api/team`, `PUT /api/team/:id`, `DELETE /api/team/:id` — require an `X-Admin-Token` header matching `ADMIN_TOKEN` in `.env`. Managed day-to-day through `frontend/admin/team.html`, not by editing JSON by hand.
- `GET /api/settings` — public. Returns site settings, currently just the "Accepting new patients" top banner (`{ banner: { enabled, textEn, textFr } }`).
- `PUT /api/settings` — requires `X-Admin-Token`. Partial update (only send the fields you're changing). Managed through the "Site banner" section of `frontend/admin/team.html`.

## What's a placeholder vs. what's real

Real: input validation, the JSONL append-only store, CORS setup.

Placeholder, by design: `data/submissions.jsonl` is not meant to become the
permanent system of record. Once the EMR (Accuro or Oscar) and a staff
notification approach are decided, replace the body of `POST /api/register`'s
success path with whatever that integration needs, and keep (or remove) the
local file store depending on whether you still want a local audit trail.

## Testing the endpoint manually

```
curl -X POST http://localhost:4000/api/register \
  -H "Content-Type: application/json" \
  -d '{"registeringFor":"self","fullName":"Test Patient","gender":"other","phone":"6135551234","email":"test@example.com","address":"1 Test St, Cornwall, ON","preferredLanguage":"en","consent":true}'
```
