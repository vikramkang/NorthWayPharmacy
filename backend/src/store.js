// Local placeholder storage for registration submissions.
//
// This is NOT the intended permanent design — see ProjectDocs/Architecture.md
// §5 "Open architecture decisions." It exists so the registration form has
// somewhere real to land while the EMR integration (Accuro or Oscar) and the
// staff-notification approach are still undecided.
//
// Deliberately simple: append-only JSON Lines file. No PHI is ever written
// here — only what the registration form itself collects (see Rules.md §1).

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "submissions.jsonl");

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function appendSubmission(record) {
  ensureDataDir();
  const line = JSON.stringify({ ...record, receivedAt: new Date().toISOString() });
  fs.appendFileSync(FILE, line + "\n", "utf8");
}

function readAllSubmissions() {
  ensureDataDir();
  if (!fs.existsSync(FILE)) return [];
  return fs
    .readFileSync(FILE, "utf8")
    .split("\n")
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

module.exports = { appendSubmission, readAllSubmissions, FILE };
