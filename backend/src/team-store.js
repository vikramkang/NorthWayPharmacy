// Team roster storage — provider bios shown on the public Team page.
//
// This is PUBLIC MARKETING CONTENT (name, credentials, languages, a short
// bio, accepting-new-patients status). It is not patient data and not
// health information — see ProjectDocs/Rules.md §1, which is about patient
// data, not this. Still: never put a real clinician on this list without
// their knowledge and consent, and never reuse a photo, name, or bio from
// another practice's real website — see ProjectDocs/memory.md for why this
// came up.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "team.json");

function ensureFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]", "utf8");
  }
}

function readAll() {
  ensureFile();
  const raw = fs.readFileSync(FILE, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(list) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf8");
}

function create(entry) {
  const list = readAll();
  const record = {
    id: crypto.randomUUID(),
    name: entry.name || "",
    role: entry.role || "",
    credentials: entry.credentials || "",
    languages: entry.languages || "",
    acceptingNewPatients: !!entry.acceptingNewPatients,
    bio: entry.bio || "",
    photoUrl: entry.photoUrl || "",
    order: typeof entry.order === "number" ? entry.order : list.length,
    updatedAt: new Date().toISOString()
  };
  list.push(record);
  writeAll(list);
  return record;
}

function update(id, entry) {
  const list = readAll();
  const idx = list.findIndex(m => m.id === id);
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    ...entry,
    id: list[idx].id, // id is immutable
    updatedAt: new Date().toISOString()
  };
  writeAll(list);
  return list[idx];
}

function remove(id) {
  const list = readAll();
  const next = list.filter(m => m.id !== id);
  const removed = next.length !== list.length;
  if (removed) writeAll(next);
  return removed;
}

module.exports = { readAll, create, update, remove };
