// NorthWay Clinic and Pharmacy — registration API (Phase 1 scope only).
//
// This service does exactly one job today: accept a registration submission
// from the website's Register page and get it somewhere staff can review it.
// It does not talk to Accuro, Oscar, Medeo, or Fillware — see
// ProjectDocs/Architecture.md for why and what happens when that changes.
//
// It must never accept or store health information (OHIP numbers,
// medication names, diagnoses). See ProjectDocs/Rules.md §1.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { appendSubmission, readAllSubmissions } = require("./store");
const teamStore = require("./team-store");
const settingsStore = require("./settings-store");

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = process.env.CORS_ALLOW_ALL === "true"
  ? { origin: true }
  : { origin: (process.env.FRONTEND_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean) };

app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "northway-backend", time: new Date().toISOString() });
});

const REQUIRED_FIELDS = ["registeringFor", "fullName", "phone", "email", "address", "consent"];
const ALLOWED_FIELDS = ["registeringFor", "fullName", "gender", "phone", "email", "address", "preferredLanguage", "consent"];

function validateRegistration(body) {
  const errors = [];
  if (!body || typeof body !== "object") return ["Request body must be a JSON object."];

  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    const missing = value === undefined || value === null || value === "" || (field === "consent" && value !== true);
    if (missing) errors.push(`Missing or invalid field: ${field}`);
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push("Invalid email format.");
  }

  return errors;
}

app.post("/api/register", (req, res) => {
  const errors = validateRegistration(req.body);
  if (errors.length) {
    return res.status(400).json({ ok: false, errors });
  }

  // Only persist known fields — never pass through arbitrary extra data.
  const record = {};
  for (const field of ALLOWED_FIELDS) {
    if (req.body[field] !== undefined) record[field] = req.body[field];
  }

  try {
    appendSubmission(record);
  } catch (err) {
    console.error("Failed to store registration submission:", err);
    return res.status(500).json({ ok: false, errors: ["Internal error saving submission."] });
  }

  // TODO (Phase 1 remaining work): notify staff — email, a review dashboard,
  // or a direct feed into the EMR/task queue once Accuro vs. Oscar is
  // decided. Today, submissions just accumulate in data/submissions.jsonl
  // and must be checked manually — see ProjectDocs/Phase.md.
  console.log("New registration submission received for:", record.fullName);

  res.status(201).json({ ok: true });
});

// Small internal helper endpoint for staff to see what's queued, until a
// real review workflow exists. Disabled unless explicitly enabled, and even
// then has no auth — it's a local-dev convenience, not something to deploy
// publicly. Add real auth before this (or anything like it) goes anywhere
// staff-facing outside your own machine.
app.get("/api/register/_pending", (req, res) => {
  if (process.env.ENABLE_DEV_PENDING_ROUTE !== "true") {
    return res.status(404).json({ ok: false, errors: ["Not found."] });
  }
  res.json({ submissions: readAllSubmissions() });
});

// ---------------------------------------------------------------------
// Team roster — public marketing bios (name, credentials, languages, a
// short bio, accepting-new-patients status). Not patient data. See
// ProjectDocs/Rules.md before adding a real person here without consent,
// and never copy a photo/bio from another practice's real website.
// ---------------------------------------------------------------------

function requireAdmin(req, res, next) {
  const token = req.header("X-Admin-Token");
  if (!process.env.ADMIN_TOKEN) {
    return res.status(503).json({ ok: false, errors: ["Admin editing is not configured on this server."] });
  }
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, errors: ["Invalid or missing admin token."] });
  }
  next();
}

function validateTeamMember(body, { partial = false } = {}) {
  const errors = [];
  if (!body || typeof body !== "object") return ["Request body must be a JSON object."];
  const required = ["name", "role"];
  if (!partial) {
    for (const field of required) {
      if (!body[field]) errors.push(`Missing field: ${field}`);
    }
  }
  if (body.photoUrl && !/^https?:\/\//.test(body.photoUrl)) {
    errors.push("photoUrl must be a full http(s) URL.");
  }
  return errors;
}

// Public — the frontend Team page fetches this directly, no auth needed.
app.get("/api/team", (req, res) => {
  const list = teamStore.readAll().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  res.json({ team: list });
});

// Everything below requires the admin token — see backend/README.md for
// how to set ADMIN_TOKEN and use the admin page.
app.post("/api/team", requireAdmin, (req, res) => {
  const errors = validateTeamMember(req.body);
  if (errors.length) return res.status(400).json({ ok: false, errors });
  const record = teamStore.create(req.body);
  res.status(201).json({ ok: true, member: record });
});

app.put("/api/team/:id", requireAdmin, (req, res) => {
  const errors = validateTeamMember(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ ok: false, errors });
  const record = teamStore.update(req.params.id, req.body);
  if (!record) return res.status(404).json({ ok: false, errors: ["No team member with that id."] });
  res.json({ ok: true, member: record });
});

app.delete("/api/team/:id", requireAdmin, (req, res) => {
  const removed = teamStore.remove(req.params.id);
  if (!removed) return res.status(404).json({ ok: false, errors: ["No team member with that id."] });
  res.json({ ok: true });
});

// ---------------------------------------------------------------------
// Site settings — small public marketing settings staff can toggle without
// a code change/rebuild. Today: the "Accepting new patients" top banner.
// ---------------------------------------------------------------------

function validateSettingsUpdate(body) {
  const errors = [];
  if (!body || typeof body !== "object") return ["Request body must be a JSON object."];
  if (body.banner !== undefined) {
    if (typeof body.banner !== "object" || body.banner === null) {
      errors.push("banner must be an object.");
    } else {
      if (body.banner.enabled !== undefined && typeof body.banner.enabled !== "boolean") {
        errors.push("banner.enabled must be a boolean.");
      }
      if (body.banner.textEn !== undefined && typeof body.banner.textEn !== "string") {
        errors.push("banner.textEn must be a string.");
      }
      if (body.banner.textFr !== undefined && typeof body.banner.textFr !== "string") {
        errors.push("banner.textFr must be a string.");
      }
    }
  }
  return errors;
}

// Public — the frontend fetches this on every page load to render the
// top banner without waiting on a site rebuild.
app.get("/api/settings", (req, res) => {
  res.json(settingsStore.readSettings());
});

// Admin-token gated — same shared-secret pattern as /api/team.
app.put("/api/settings", requireAdmin, (req, res) => {
  const errors = validateSettingsUpdate(req.body);
  if (errors.length) return res.status(400).json({ ok: false, errors });
  const record = settingsStore.updateSettings(req.body);
  res.json({ ok: true, settings: record });
});

app.use((req, res) => {
  res.status(404).json({ ok: false, errors: ["Not found."] });
});

app.listen(PORT, () => {
  console.log(`NorthWay backend listening on http://localhost:${PORT}`);
});
