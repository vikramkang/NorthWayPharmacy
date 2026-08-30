// Site settings — small, public, non-patient marketing settings that staff
// can change without a developer editing code and re-running the site
// generator. Today this is just the "Accepting new patients" top banner;
// see ProjectDocs/Architecture.md §7 before growing this into anything more
// than a handful of simple marketing toggles/strings.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const FILE = path.join(DATA_DIR, "site-settings.json");

const DEFAULTS = {
  banner: {
    enabled: true,
    textEn: "Accepting new patients",
    textFr: "Nous acceptons de nouveaux patients"
  },
  updatedAt: null
};

function ensureFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify(DEFAULTS, null, 2), "utf8");
  }
}

function readSettings() {
  ensureFile();
  const raw = fs.readFileSync(FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    // Merge over defaults so a partially-written file (or an older version
    // of this file, from before a new field was added) still works.
    return {
      ...DEFAULTS,
      ...parsed,
      banner: { ...DEFAULTS.banner, ...(parsed.banner || {}) }
    };
  } catch {
    return DEFAULTS;
  }
}

function updateSettings(partial) {
  const current = readSettings();
  const next = {
    ...current,
    banner: { ...current.banner, ...(partial.banner || {}) },
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8");
  return next;
}

module.exports = { readSettings, updateSettings };
