// NorthWay Clinic and Pharmacy — Phase 1 static site generator.
// Generates a plain HTML/CSS/JS site (no build step needed to host it).
// Run: node build-site.js   -> writes into ./{en,fr}/*.html and ./index.html
// (assets/css, assets/js are hand-maintained, not generated)
//
// Content rules:
// - This file is patient-facing. Internal/engineering notes go in HTML
//   comments or ProjectDocs — never in a visible on-page box.
// - Keep it short. Ledes are a handful of words, not sentences. One idea
//   per card. If you're tempted to add a second sentence, cut the first
//   one instead. See ProjectDocs/Rules.md.

const fs = require("fs");
const path = require("path");

const OUT = __dirname;

// Temporary demo hosting origin (GitHub Pages) — used only for absolute
// og:image/og:url tags so the link looks right when shared during the
// client demo. Set to "" (relative) once a real domain is picked for
// launch, and remove the sitewide noindex meta tag / robots.txt block at
// the same time — see ProjectDocs/Architecture.md §5 and Rules.md.
const SITE_ORIGIN = "https://vikramkang.github.io/NorthWayPharmacy";

// ---------------------------------------------------------------------
// Chrome strings (nav, footer, buttons) per language
// ---------------------------------------------------------------------
const T = {
  en: {
    dir: "en", htmlLang: "en",
    phone: "[PHONE NUMBER]",
    badge: "Accepting new patients",
    nav: [
      ["index.html", "Home"],
      ["book-appointment.html", "Book an Appointment"],
      ["clinic-services.html", "Clinic Services"],
      ["pharmacy-services.html", "Pharmacy Services"],
      ["about.html", "About Us"]
    ],
    footerHours: "Hours",
    footerHoursLines: ["Mon–Fri: 10:00 am – 6:00 pm", "Saturday: 10:00 am – 2:00 pm", "Sunday: Closed"],
    footerQuick: "Quick Links",
    footerContact: "Contact",
    footerAddress: "[STREET ADDRESS], Cornwall, ON [POSTAL CODE]",
    privacy: "Privacy Policy",
    rights: "NorthWay Clinic and Pharmacy. All rights reserved.",
    skip: "Skip to main content"
  },
  fr: {
    dir: "fr", htmlLang: "fr",
    phone: "[NUMÉRO DE TÉLÉPHONE]",
    badge: "Nous acceptons de nouveaux patients",
    nav: [
      ["index.html", "Accueil"],
      ["book-appointment.html", "Prendre rendez-vous"],
      ["clinic-services.html", "Services de la clinique"],
      ["pharmacy-services.html", "Services de la pharmacie"],
      ["about.html", "À propos de nous"]
    ],
    footerHours: "Heures d'ouverture",
    footerHoursLines: ["Lun–Ven : 10 h – 18 h", "Samedi : 10 h – 14 h", "Dimanche : fermé"],
    footerQuick: "Liens rapides",
    footerContact: "Coordonnées",
    footerAddress: "[ADRESSE], Cornwall, ON [CODE POSTAL]",
    privacy: "Politique de confidentialité",
    rights: "Clinique et pharmacie NorthWay. Tous droits réservés.",
    skip: "Passer au contenu principal"
  }
};

// ---------------------------------------------------------------------
// Icon set — small hand-drawn line icons (replacing emoji, which render
// inconsistently across platforms/browsers with mismatched colors/styles).
// All stroke-based icons use currentColor so they inherit the badge's own
// accent color (see .icon-badge.b-accent / .b-accent2 in style.css).
// ---------------------------------------------------------------------
const ICONS = {
  stethoscope: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v5.5a3.5 3.5 0 0 0 7 0V3"/><path d="M10.5 12v1.5a4 4 0 0 0 8 0v-1.5"/><circle cx="18.5" cy="16.2" r="2.1"/></svg>`,
  pill: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="6" rx="3" transform="rotate(-45 12 12)"/><line x1="12" y1="6.8" x2="12" y2="17.2" transform="rotate(-45 12 12)"/></svg>`,
  house: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h5v-5h2v5h5v-9"/></svg>`,
  bilingual: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="13" height="9" rx="3"/><rect x="8" y="10" width="13" height="9" rx="3"/></svg>`,
  cross: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><line x1="12" y1="8.2" x2="12" y2="15.8"/><line x1="8.2" y1="12" x2="15.8" y2="12"/></svg>`,
  droplet: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c-3 4-5.2 7-5.2 10a5.2 5.2 0 0 0 10.4 0c0-3-2.2-6-5.2-10z"/></svg>`,
  box: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="8" width="11" height="7.5" rx="1"/><path d="M13.5 11h4l3 3v1.5h-7z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></svg>`,
  person: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.3"/><path d="M5 20c1-4.2 4-6.3 7-6.3s6 2.1 7 6.3"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12.5" r="8"/><path d="M12 8v4.5l3 2"/></svg>`,
  alarm: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="7.5"/><path d="M12 9.5v4l2.6 1.7"/><path d="M5.5 5.5l-2 2"/><path d="M18.5 5.5l2 2"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" stroke="none"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.8 8.8 0 1 0 10.5 10.5z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-7.4 7-12.2A7 7 0 0 0 5 8.8C5 13.6 12 21 12 21z"/><circle cx="12" cy="8.8" r="2.3"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" stroke="none"><path d="M6.6 3.3 9.8 3l1.6 4.6-2 1.7a11 11 0 0 0 5.3 5.3l1.7-2 4.6 1.6-.3 3.2a2 2 0 0 1-2.1 1.8A16.4 16.4 0 0 1 4.8 5.4a2 2 0 0 1 1.8-2.1z"/></svg>`
};

// Placeholder logo mark (see ProjectDocs/Rules.md) — a simple generated
// cross-in-rounded-square with an accent dot, used in the header and as
// the favicon (frontend/assets/img/favicon.svg is the same design).
// Replace with the real brand logo once one is supplied.
const LOGO_MARK = `<svg viewBox="0 0 40 40" width="34" height="34"><rect x="1" y="1" width="38" height="38" rx="10" fill="#0E7C66"/><path d="M20 9v22M9 20h22" stroke="#FFFFFF" stroke-width="4.2" stroke-linecap="round"/><circle cx="30.5" cy="30.5" r="6.5" fill="#E8873A"/></svg>`;

// ---------------------------------------------------------------------
// Shared markup helpers
// ---------------------------------------------------------------------
function card(icon, badgeClass, title, text, href) {
  const badge = icon ? `<div class="icon-badge ${badgeClass}">${icon}</div>` : "";
  const textHtml = text ? `<p>${text}</p>` : "";
  const inner = `${badge}<h3>${title}</h3>${textHtml}`;
  return href ? `<a class="card" href="${href}">${inner}</a>` : `<div class="card">${inner}</div>`;
}

function navLabel(t, href) {
  const entry = t.nav.find(([h]) => h === href);
  return entry ? entry[1] : href;
}

function layout({ lang, slug, title, metaDesc, body }) {
  const t = T[lang];
  const navLinks = t.nav.map(([href, label]) => {
    const current = href === slug + ".html";
    const isCta = href === "book-appointment.html";
    const classAttr = isCta ? ' class="nav-cta"' : "";
    return `<li><a href="${href}"${classAttr}${current ? ' aria-current="page"' : ""}>${label}</a></li>`;
  }).join("\n            ");

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — NorthWay Clinic and Pharmacy</title>
<meta name="description" content="${metaDesc}">
<meta name="robots" content="noindex, nofollow"><!-- temporary demo domain — remove once the real launch domain is live -->
<meta property="og:type" content="website">
<meta property="og:title" content="${title} — NorthWay Clinic and Pharmacy">
<meta property="og:description" content="${metaDesc}">
<meta property="og:image" content="${SITE_ORIGIN}/assets/img/home-reception.jpg">
<meta property="og:url" content="${SITE_ORIGIN}/${lang}/${slug}.html">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="icon" type="image/svg+xml" href="../assets/img/favicon.svg">
<link rel="alternate icon" href="../assets/img/favicon-32.png">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png">
<meta name="theme-color" content="#0E7C66">
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
<a class="skip-link" href="#main">${t.skip}</a>

<div class="topbar">
  <div class="container">
    <span class="badge" id="site-badge">${t.badge}</span>
    <div style="display:flex; align-items:center; gap:18px;">
      <a href="tel:${t.phone.replace(/[^0-9+]/g, "") || "#"}">${t.phone}</a>
      <span class="lang-toggle"></span>
    </div>
  </div>
</div>

<header class="site-header">
  <div class="container header-inner">
    <!-- PLACEHOLDER LOGO: generated mark, not final branding. Swap for the
         real logo once supplied — see ProjectDocs/Rules.md. -->
    <a class="wordmark" href="index.html">
      <span class="logo-mark" aria-hidden="true">${LOGO_MARK}</span>
      <span class="wordmark-text">NorthWay<span>Clinic &amp; Pharmacy</span></span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="main-nav">Menu</button>
    <nav class="main-nav" id="main-nav" aria-label="${lang === "en" ? "Main navigation" : "Navigation principale"}">
      <ul>
        ${navLinks}
      </ul>
    </nav>
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <h4>${t.footerHours}</h4>
        <ul>${t.footerHoursLines.map(l => `<li>${l}</li>`).join("")}</ul>
      </div>
      <div>
        <h4>${t.footerQuick}</h4>
        <ul>
          <li><a href="book-appointment.html">${navLabel(t, "book-appointment.html")}</a></li>
          <li><a href="clinic-services.html">${navLabel(t, "clinic-services.html")}</a></li>
          <li><a href="about.html">${navLabel(t, "about.html")}</a></li>
        </ul>
      </div>
      <div>
        <h4>${t.footerContact}</h4>
        <ul>
          <li>${t.footerAddress}</li>
          <li><a href="tel:${t.phone.replace(/[^0-9+]/g, "") || "#"}">${t.phone}</a></li>
          <li><a href="mailto:[EMAIL ADDRESS]">[EMAIL ADDRESS]</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <a href="privacy-policy.html">${t.privacy}</a> &nbsp;·&nbsp; © 2026 ${t.rights}
    </div>
  </div>
</footer>

<script src="../assets/js/config.js"></script>
<script src="../assets/js/main.js"></script>
</body>
</html>
`;
}

function fixLangToggle(html, lang, slug) {
  const otherHref = "../" + (lang === "en" ? "fr" : "en") + "/" + slug + ".html";
  const selfLabel = lang === "en" ? "EN" : "FR";
  const otherLabel = lang === "en" ? "FR" : "EN";
  const block = `<span class="lang-toggle"><a href="#" class="current" aria-current="true">${selfLabel}</a> | <a href="${otherHref}">${otherLabel}</a></span>`;
  return html.replace(/<span class="lang-toggle"><\/span>/, block);
}

function heroSection({ h1, lede, primary, secondary, image }) {
  const text = `<div class="hero-text">
      <h1>${h1}</h1>
      ${lede ? `<p class="lede">${lede}</p>` : ""}
      <div class="btn-row">
        <a class="btn btn-primary" href="${primary.href}">${primary.label}</a>
        <a class="btn btn-secondary" href="${secondary.href}">${secondary.label}</a>
      </div>
    </div>`;
  const media = image
    ? `<div class="hero-media"><div class="photo-frame"><img src="${image.src}" alt="${image.alt}" width="1200" height="900"></div></div>`
    : "";
  return `<section class="hero">
    <div class="container${image ? " hero-grid" : ""}">
      ${text}
      ${media}
    </div>
  </section>`;
}

function pageHeader(h1, lede) {
  return `<div class="page-header"><div class="container"><h1>${h1}</h1><p class="lede">${lede}</p></div></div>`;
}

// Photography note (see ProjectDocs/Rules.md §1a): these are the client's
// own supplied stock photos (dropped directly into frontend/, now optimized
// and moved into assets/img/ — see memory.md for the resize/compress
// pipeline). Nothing here depicts a real, named NorthWay clinician; they're
// generic/illustrative only.
function photoBand(src, alt) {
  return `<div class="container"><div class="photo-frame photo-band"><img src="${src}" alt="${alt}" loading="lazy" width="1400" height="800"></div></div>`;
}

// ---------------------------------------------------------------------
// Page content — English
// ---------------------------------------------------------------------
const pagesEn = {};

pagesEn.index = {
  title: "Home",
  metaDesc: "Family medicine, walk-in and urgent care, and full-service pharmacy in Cornwall, Ontario.",
  body: `
${heroSection({
  h1: "Cornwall's Family Clinic and Pharmacy",
  primary: { href: "book-appointment.html", label: "Register or Book" },
  secondary: { href: "about.html#team", label: "Meet the Team" },
  image: { src: "../assets/img/home-reception.jpg", alt: "A NorthWay staff member helping a patient at the reception desk" }
})}

<div class="trust-strip">
  <div class="container trust-strip-row">
    <span class="trust-item">${ICONS.person} Licensed pharmacists &amp; physicians</span>
    <span class="trust-item">${ICONS.bilingual} Bilingual: English &amp; French</span>
    <span class="trust-item">${ICONS.house} Clinic and pharmacy, one visit</span>
    <span class="trust-item">${ICONS.pin} Serving Cornwall, ON</span>
  </div>
</div>

<section class="reveal">
  <div class="container">
    <h2>What we offer</h2>
    <div class="card-grid">
      ${card(ICONS.stethoscope,"b-accent", "Family &amp; Walk-In Clinic", null, "clinic-services.html")}
      ${card(ICONS.pill,"b-accent2", "Pharmacy Services", null, "pharmacy-services.html")}
      ${card(ICONS.house,"b-accent", "Long-Term Care Support", null, "pharmacy-services.html#long-term-care")}
      ${card(ICONS.bilingual,"b-accent2", "Bilingual Service", null, null)}
    </div>
  </div>
</section>

<section class="reveal">
  <div class="container">
    <div class="strip">
      <div class="block"><h3>Hours</h3><p>Mon–Fri: 10 am – 6 pm<br>Saturday: 10 am – 2 pm</p></div>
      <div class="block"><h3>Location</h3><p>[STREET ADDRESS], Cornwall, ON</p></div>
      <div class="block"><h3>Phone</h3><p><a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a></p></div>
      <div class="block"><a class="btn btn-secondary" href="about.html#visit-us">Get directions</a></div>
    </div>
  </div>
</section>

<section class="reveal">
  <div class="container">
    <div class="callout info">
      <h2>New here?</h2>
      <p>Registering takes about a minute.</p>
      <a class="btn btn-primary" href="book-appointment.html">Register Now</a>
    </div>
  </div>
</section>
`
};

pagesEn["book-appointment"] = {
  title: "Book an Appointment",
  metaDesc: "Register as a new patient or book an appointment through Medeo at NorthWay Clinic and Pharmacy.",
  body: `
${pageHeader("Book an Appointment", "New or returning — start here.")}

<section class="reveal">
  <div class="container">
    <h2>New Patient</h2>
    <div class="form-note">Takes about a minute. We'll take it from there.</div>

    <form class="stack" id="register-form" novalidate>
      <div class="field">
        <label for="reg-for">Who is this for?</label>
        <select id="reg-for" name="registeringFor" required>
          <option value="">Select one</option>
          <option value="self">Myself</option>
          <option value="dependent">My child or a dependent</option>
        </select>
        <p class="hint">A parent or guardian must register a child.</p>
      </div>

      <div class="field">
        <label for="full-name">Full name</label>
        <input type="text" id="full-name" name="fullName" required autocomplete="name">
      </div>

      <fieldset>
        <legend>Gender</legend>
        <div class="radio-row">
          <label><input type="radio" name="gender" value="female"> Female</label>
          <label><input type="radio" name="gender" value="male"> Male</label>
          <label><input type="radio" name="gender" value="other"> Other</label>
        </div>
      </fieldset>

      <div class="field">
        <label for="phone">Phone number</label>
        <input type="tel" id="phone" name="phone" required autocomplete="tel">
      </div>

      <div class="field">
        <label for="email">Email address</label>
        <input type="email" id="email" name="email" required autocomplete="email">
      </div>

      <div class="field">
        <label for="address">Home address</label>
        <input type="text" id="address" name="address" required autocomplete="street-address">
      </div>

      <div class="field">
        <label for="pref-lang">Preferred language</label>
        <select id="pref-lang" name="preferredLanguage">
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>

      <div class="field consent">
        <input type="checkbox" id="consent" name="consent" required>
        <label for="consent">You can contact me by phone, email, or text.</label>
      </div>

      <button type="submit" class="btn btn-primary">Submit Registration</button>
      <p class="hint" id="form-error" hidden>Something went wrong. Please call <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a>.</p>
    </form>

    <div class="callout info" id="form-confirmation" hidden>
      <h2>Thank you</h2>
      <p>We'll be in touch shortly to book your first visit.</p>
    </div>
  </div>
</section>

<section class="reveal">
  <div class="container">
    <h2>Returning Patient</h2>
    <div class="card" style="max-width:520px;">
      <p>Book online through Medeo.</p>
      <a class="btn btn-primary" href="#">Open Medeo Booking</a>
      <!-- TODO: replace with the practice's live Medeo booking URL before launch -->
    </div>
    <p class="hint" style="margin-top:20px;">Something urgent? <a href="clinic-services.html#urgent-care">See what to do instead</a>.</p>
  </div>
</section>
`
};

pagesEn["clinic-services"] = {
  title: "Clinic Services",
  metaDesc: "Family physician, walk-in, and urgent care services at NorthWay Clinic.",
  body: `
${pageHeader("Clinic Services", "Family medicine and urgent care.")}
${photoBand("../assets/img/family-physician.jpg", "A family physician checking on a happy baby, held by their smiling parent")}
<section class="reveal">
  <div class="container">
    <div class="card-grid">
      <div class="card">
        <div class="icon-badge b-accent">${ICONS.stethoscope}</div>
        <h3>Family Physician Care</h3>
        <p>Check-ups, chronic care, and referrals.</p>
        <p>Accepting new patients</p>
        <!-- TODO: confirm current accepting-new-patients status before launch -->
      </div>
      <div class="card">
        <div class="icon-badge b-accent2">${ICONS.cross}</div>
        <h3>Walk-In &amp; Urgent Care</h3>
        <p>Same-day visits, no appointment needed.</p>
      </div>
    </div>

    <div class="callout info" style="margin-top:28px;">
      <h3>What to bring</h3>
      <p>Your health card and current medications.</p>
    </div>

    <div class="btn-row">
      <a class="btn btn-primary" href="book-appointment.html">Register or Book</a>
    </div>
  </div>
</section>

<section class="reveal" id="urgent-care">
  <div class="container">
    <h2>Urgent care guidance</h2>
    <div class="callout warn">
      <h3>Medical emergency?</h3>
      <p><strong>Call 911</strong> or go to Cornwall Community Hospital's Emergency Department.</p>
    </div>

    <div class="card-grid" style="margin-top:28px;">
      <div class="card">
        <div class="icon-badge b-accent">${ICONS.alarm}</div>
        <h3>Urgent, during our hours</h3>
        <p>Call <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a> — often same-day.</p>
      </div>
      <div class="card">
        <div class="icon-badge b-accent2">${ICONS.moon}</div>
        <h3>Outside of our hours</h3>
        <p>Call Health811 (8-1-1), any time.</p>
      </div>
    </div>

    <p class="hint" style="margin-top:24px;">Don't email for anything urgent — call instead.</p>
  </div>
</section>
`
};

pagesEn["pharmacy-services"] = {
  title: "Pharmacy Services",
  metaDesc: "Retail dispensing, vaccinations, and compliance packaging at NorthWay Pharmacy.",
  body: `
${pageHeader("Pharmacy Services", "Everything you need, close by.")}
${photoBand("../assets/img/pharmacy-prescription.jpg", "A pharmacist preparing a bilingual prescription pickup")}
<section class="reveal">
  <div class="container">
    <div class="card-grid">
      ${card(ICONS.pill,"b-accent", "Prescriptions", "Filled with a pharmacist consultation.")}
      ${card(ICONS.droplet,"b-accent2", "Vaccinations", "Seasonal and travel shots, walk in anytime.")}
      ${card(ICONS.box,"b-accent", "Easy-to-Follow Packaging", "Sorted by date and time.")}
      ${card(ICONS.house,"b-accent2", "Long-Term Care &amp; Retirement Home Services", null, "#long-term-care")}
    </div>

    <p class="hint" style="margin-top:28px;">Need a refill or transfer? Call <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a>.</p>
  </div>
</section>

<section class="reveal" id="long-term-care">
  <div class="container"><h2>Long-Term Care &amp; Retirement Home Services</h2></div>
  ${photoBand("../assets/img/ltc-support.jpg", "A caregiver holding hands with a resident during a home visit")}
  <div class="container">
    <div class="card-grid">
      ${card(ICONS.box,"b-accent", "Easy-to-Follow Packaging", "Organized by resident, date, and time.")}
      ${card(ICONS.truck,"b-accent2", "Scheduled Delivery", "Built around your facility's routine.")}
      ${card(ICONS.person,"b-accent", "One Point of Contact", "A dedicated pharmacist for your team.")}
    </div>
    <div class="callout info" style="margin-top:28px;">
      <h3>Interested in partnering?</h3>
      <p>Contact us at <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a> or <a href="mailto:[EMAIL ADDRESS]">[EMAIL ADDRESS]</a>.</p>
    </div>
  </div>
</section>
`
};

pagesEn.about = {
  title: "About Us",
  metaDesc: "About NorthWay Clinic and Pharmacy, our team, and how to find us in Cornwall, Ontario.",
  body: `
${pageHeader("About Us", "The people behind NorthWay — and how to find us.")}
<section class="reveal">
  <div class="container hero-grid">
    <div class="hero-text">
      <!-- TODO: replace with the real practice story once provided -->
      <p>Your family doctor and pharmacist, working together, just down the hall from each other.</p>
      <a class="btn btn-secondary" href="#team">Meet the Team</a>
    </div>
    <div class="hero-media hero-media--tall">
      <div class="photo-frame">
        <img src="../assets/img/about-stethoscope.jpg" alt="Close-up of a stethoscope, one of the everyday tools our clinicians use" width="900" height="1350">
      </div>
    </div>
  </div>
</section>

<section class="reveal" id="team">
  <div class="container">
    <h2>Our team</h2>
    <div class="team-grid" id="team-list">Loading…</div>
  </div>
</section>

<section class="reveal" id="visit-us">
  <div class="container">
    <h2>Visit us</h2>
    <div class="card-grid">
      <div class="card">
        <div class="icon-badge b-accent">${ICONS.clock}</div>
        <h3>Hours</h3>
        <table class="hours">
          <tr><td>Monday – Friday</td><td>10:00 am – 6:00 pm</td></tr>
          <tr><td>Saturday</td><td>10:00 am – 2:00 pm</td></tr>
          <tr><td>Sunday</td><td>Closed</td></tr>
        </table>
      </div>
      <div class="card">
        <div class="icon-badge b-accent2">${ICONS.pin}</div>
        <h3>Location &amp; Parking</h3>
        <p>[STREET ADDRESS], Cornwall, ON [POSTAL CODE]</p>
        <p>Parking on-site.</p>
        <!-- TODO: embed a map once the address is finalized -->
      </div>
      <div class="card">
        <div class="icon-badge b-accent">${ICONS.phone}</div>
        <h3>Contact</h3>
        <p>Phone: <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a></p>
        <p>Email: <a href="mailto:[EMAIL ADDRESS]">[EMAIL ADDRESS]</a></p>
      </div>
    </div>
  </div>
</section>
`
};

pagesEn["privacy-policy"] = {
  title: "Privacy Policy",
  metaDesc: "Privacy policy for NorthWay Clinic and Pharmacy.",
  body: `
<!-- INTERNAL NOTE: this policy must be reviewed and approved by NorthWay's
     compliance officer before the live site launches. Treat this text as a
     starting point, not a final policy. See ProjectDocs/Rules.md. -->
${pageHeader("Privacy Policy", "How we use your information.")}
<section class="reveal">
  <div class="container">
    <h3>What we collect</h3>
    <p>Registration collects your name, gender, phone, email, and address only — no health information.</p>

    <h3>How it's used</h3>
    <p>Staff review it to confirm your registration and book your first visit.</p>

    <h3>Booking</h3>
    <p>Appointments are booked through Medeo, our scheduling partner.</p>

    <h3>Questions</h3>
    <p>Contact us at <a href="mailto:[EMAIL ADDRESS]">[EMAIL ADDRESS]</a>.</p>
  </div>
</section>
`
};

// ---------------------------------------------------------------------
// Page content — French
// ---------------------------------------------------------------------
const pagesFr = {};

pagesFr.index = {
  title: "Accueil",
  metaDesc: "Médecine familiale, soins sans rendez-vous et pharmacie complète à Cornwall, en Ontario.",
  body: `
${heroSection({
  h1: "La clinique et pharmacie familiale de Cornwall",
  primary: { href: "book-appointment.html", label: "S'inscrire ou réserver" },
  secondary: { href: "about.html#team", label: "Rencontrer l'équipe" },
  image: { src: "../assets/img/home-reception.jpg", alt: "Un membre du personnel de NorthWay aide une patiente à la réception" }
})}

<div class="trust-strip">
  <div class="container trust-strip-row">
    <span class="trust-item">${ICONS.person} Pharmaciens et médecins agréés</span>
    <span class="trust-item">${ICONS.bilingual} Bilingue : français et anglais</span>
    <span class="trust-item">${ICONS.house} Clinique et pharmacie, en une visite</span>
    <span class="trust-item">${ICONS.pin} Au service de Cornwall, ON</span>
  </div>
</div>

<section class="reveal">
  <div class="container">
    <h2>Nos services</h2>
    <div class="card-grid">
      ${card(ICONS.stethoscope,"b-accent", "Clinique familiale et sans rendez-vous", null, "clinic-services.html")}
      ${card(ICONS.pill,"b-accent2", "Services de pharmacie", null, "pharmacy-services.html")}
      ${card(ICONS.house,"b-accent", "Soutien aux soins de longue durée", null, "pharmacy-services.html#long-term-care")}
      ${card(ICONS.bilingual,"b-accent2", "Service bilingue", null, null)}
    </div>
  </div>
</section>

<section class="reveal">
  <div class="container">
    <div class="strip">
      <div class="block"><h3>Heures</h3><p>Lun–Ven : 10 h – 18 h<br>Samedi : 10 h – 14 h</p></div>
      <div class="block"><h3>Emplacement</h3><p>[ADRESSE], Cornwall, ON</p></div>
      <div class="block"><h3>Téléphone</h3><p><a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a></p></div>
      <div class="block"><a class="btn btn-secondary" href="about.html#visit-us">Obtenir l'itinéraire</a></div>
    </div>
  </div>
</section>

<section class="reveal">
  <div class="container">
    <div class="callout info">
      <h2>Nouveau ici?</h2>
      <p>L'inscription prend environ une minute.</p>
      <a class="btn btn-primary" href="book-appointment.html">S'inscrire</a>
    </div>
  </div>
</section>
`
};

pagesFr["book-appointment"] = {
  title: "Prendre rendez-vous",
  metaDesc: "Inscrivez-vous comme nouveau patient ou prenez rendez-vous en ligne grâce à Medeo.",
  body: `
${pageHeader("Prendre rendez-vous", "Nouveau ou déjà patient — commencez ici.")}

<section class="reveal">
  <div class="container">
    <h2>Nouveau patient</h2>
    <div class="form-note">Environ une minute. On s'occupe du reste.</div>

    <form class="stack" id="register-form" novalidate>
      <div class="field">
        <label for="reg-for">Pour qui est-ce?</label>
        <select id="reg-for" name="registeringFor" required>
          <option value="">Choisir une option</option>
          <option value="self">Moi-même</option>
          <option value="dependent">Mon enfant ou une personne à charge</option>
        </select>
        <p class="hint">Un parent ou tuteur doit inscrire un enfant.</p>
      </div>

      <div class="field">
        <label for="full-name">Nom complet</label>
        <input type="text" id="full-name" name="fullName" required autocomplete="name">
      </div>

      <fieldset>
        <legend>Genre</legend>
        <div class="radio-row">
          <label><input type="radio" name="gender" value="female"> Femme</label>
          <label><input type="radio" name="gender" value="male"> Homme</label>
          <label><input type="radio" name="gender" value="other"> Autre</label>
        </div>
      </fieldset>

      <div class="field">
        <label for="phone">Numéro de téléphone</label>
        <input type="tel" id="phone" name="phone" required autocomplete="tel">
      </div>

      <div class="field">
        <label for="email">Adresse courriel</label>
        <input type="email" id="email" name="email" required autocomplete="email">
      </div>

      <div class="field">
        <label for="address">Adresse résidentielle</label>
        <input type="text" id="address" name="address" required autocomplete="street-address">
      </div>

      <div class="field">
        <label for="pref-lang">Langue préférée</label>
        <select id="pref-lang" name="preferredLanguage">
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      <div class="field consent">
        <input type="checkbox" id="consent" name="consent" required>
        <label for="consent">Vous pouvez me contacter par téléphone, courriel ou texto.</label>
      </div>

      <button type="submit" class="btn btn-primary">Soumettre l'inscription</button>
      <p class="hint" id="form-error" hidden>Une erreur est survenue. Appelez le <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a>.</p>
    </form>

    <div class="callout info" id="form-confirmation" hidden>
      <h2>Merci</h2>
      <p>Nous communiquerons avec vous sous peu pour votre premier rendez-vous.</p>
    </div>
  </div>
</section>

<section class="reveal">
  <div class="container">
    <h2>Patient existant</h2>
    <div class="card" style="max-width:520px;">
      <p>Réservez en ligne avec Medeo.</p>
      <a class="btn btn-primary" href="#">Ouvrir Medeo</a>
      <!-- TODO: replace with the practice's live Medeo booking URL before launch -->
    </div>
    <p class="hint" style="margin-top:20px;">Besoin de soins urgents? <a href="clinic-services.html#urgent-care">Voyez quoi faire</a>.</p>
  </div>
</section>
`
};

pagesFr["clinic-services"] = {
  title: "Services de la clinique",
  metaDesc: "Médecine familiale, soins sans rendez-vous et soins urgents à la Clinique NorthWay.",
  body: `
${pageHeader("Services de la clinique", "Médecine familiale et soins urgents.")}
${photoBand("../assets/img/family-physician.jpg", "Un médecin de famille examine un bébé souriant, tenu par son parent")}
<section class="reveal">
  <div class="container">
    <div class="card-grid">
      <div class="card">
        <div class="icon-badge b-accent">${ICONS.stethoscope}</div>
        <h3>Soins de médecine familiale</h3>
        <p>Bilans, gestion des maladies chroniques, orientations.</p>
        <p>Accepte de nouveaux patients</p>
      </div>
      <div class="card">
        <div class="icon-badge b-accent2">${ICONS.cross}</div>
        <h3>Soins sans rendez-vous et urgents</h3>
        <p>Visites le jour même, sans rendez-vous.</p>
      </div>
    </div>

    <div class="callout info" style="margin-top:28px;">
      <h3>Quoi apporter</h3>
      <p>Votre carte santé et vos médicaments actuels.</p>
    </div>

    <div class="btn-row">
      <a class="btn btn-primary" href="book-appointment.html">S'inscrire ou réserver</a>
    </div>
  </div>
</section>

<section class="reveal" id="urgent-care">
  <div class="container">
    <h2>Que faire en cas d'urgence</h2>
    <div class="callout warn">
      <h3>Urgence médicale?</h3>
      <p><strong>Composez le 911</strong> ou rendez-vous aux urgences de l'Hôpital communautaire de Cornwall.</p>
    </div>

    <div class="card-grid" style="margin-top:28px;">
      <div class="card">
        <div class="icon-badge b-accent">${ICONS.alarm}</div>
        <h3>Urgent, pendant nos heures</h3>
        <p>Appelez le <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a> — souvent le jour même.</p>
      </div>
      <div class="card">
        <div class="icon-badge b-accent2">${ICONS.moon}</div>
        <h3>En dehors de nos heures</h3>
        <p>Composez Health811 (8-1-1), en tout temps.</p>
      </div>
    </div>

    <p class="hint" style="margin-top:24px;">N'envoyez pas de courriel pour une urgence — appelez-nous.</p>
  </div>
</section>
`
};

pagesFr["pharmacy-services"] = {
  title: "Services de la pharmacie",
  metaDesc: "Distribution de médicaments, vaccinations et emballage de conformité à la Pharmacie NorthWay.",
  body: `
${pageHeader("Services de la pharmacie", "Tout ce qu'il vous faut, juste à côté.")}
${photoBand("../assets/img/pharmacy-prescription.jpg", "Un pharmacien préparant une ordonnance bilingue")}
<section class="reveal">
  <div class="container">
    <div class="card-grid">
      ${card(ICONS.pill,"b-accent", "Ordonnances", "Préparées avec une consultation d'un pharmacien.")}
      ${card(ICONS.droplet,"b-accent2", "Vaccinations", "Saisonnières et de voyage, sans rendez-vous.")}
      ${card(ICONS.box,"b-accent", "Emballage facile à suivre", "Organisé par date et heure.")}
      ${card(ICONS.house,"b-accent2", "Services de soins de longue durée et résidences pour retraités", null, "#long-term-care")}
    </div>

    <p class="hint" style="margin-top:28px;">Besoin d'un renouvellement ou transfert? Appelez le <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a>.</p>
  </div>
</section>

<section class="reveal" id="long-term-care">
  <div class="container"><h2>Services de soins de longue durée et résidences pour retraités</h2></div>
  ${photoBand("../assets/img/ltc-support.jpg", "Une aidante tenant la main d'une résidente lors d'une visite à domicile")}
  <div class="container">
    <div class="card-grid">
      ${card(ICONS.box,"b-accent", "Emballage facile à suivre", "Organisé par résident, date et heure.")}
      ${card(ICONS.truck,"b-accent2", "Livraison planifiée", "Adaptée à la routine de votre établissement.")}
      ${card(ICONS.person,"b-accent", "Un seul point de contact", "Un pharmacien dédié pour votre équipe.")}
    </div>
    <div class="callout info" style="margin-top:28px;">
      <h3>Intéressé par un partenariat?</h3>
      <p>Contactez-nous au <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a> ou à <a href="mailto:[ADRESSE COURRIEL]">[ADRESSE COURRIEL]</a>.</p>
    </div>
  </div>
</section>
`
};

pagesFr.about = {
  title: "À propos de nous",
  metaDesc: "À propos de la Clinique et pharmacie NorthWay, notre équipe, et comment nous trouver à Cornwall, en Ontario.",
  body: `
${pageHeader("À propos de nous", "Les gens derrière NorthWay — et comment nous trouver.")}
<section class="reveal">
  <div class="container hero-grid">
    <div class="hero-text">
      <!-- TODO: replace with the real practice story once provided -->
      <p>Votre médecin de famille et votre pharmacien, ensemble, juste à côté l'un de l'autre.</p>
      <a class="btn btn-secondary" href="#team">Rencontrer l'équipe</a>
    </div>
    <div class="hero-media hero-media--tall">
      <div class="photo-frame">
        <img src="../assets/img/about-stethoscope.jpg" alt="Gros plan d'un stéthoscope, un outil que nos cliniciens utilisent chaque jour" width="900" height="1350">
      </div>
    </div>
  </div>
</section>

<section class="reveal" id="team">
  <div class="container">
    <h2>Notre équipe</h2>
    <div class="team-grid" id="team-list">Chargement…</div>
  </div>
</section>

<section class="reveal" id="visit-us">
  <div class="container">
    <h2>Nous visiter</h2>
    <div class="card-grid">
      <div class="card">
        <div class="icon-badge b-accent">${ICONS.clock}</div>
        <h3>Heures d'ouverture</h3>
        <table class="hours">
          <tr><td>Lundi – Vendredi</td><td>10 h – 18 h</td></tr>
          <tr><td>Samedi</td><td>10 h – 14 h</td></tr>
          <tr><td>Dimanche</td><td>Fermé</td></tr>
        </table>
      </div>
      <div class="card">
        <div class="icon-badge b-accent2">${ICONS.pin}</div>
        <h3>Emplacement et stationnement</h3>
        <p>[ADRESSE], Cornwall, ON [CODE POSTAL]</p>
        <p>Stationnement sur place.</p>
        <!-- TODO: embed a map once the address is finalized -->
      </div>
      <div class="card">
        <div class="icon-badge b-accent">${ICONS.phone}</div>
        <h3>Coordonnées</h3>
        <p>Téléphone : <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a></p>
        <p>Courriel : <a href="mailto:[ADRESSE COURRIEL]">[ADRESSE COURRIEL]</a></p>
      </div>
    </div>
  </div>
</section>
`
};

pagesFr["privacy-policy"] = {
  title: "Politique de confidentialité",
  metaDesc: "Politique de confidentialité de la Clinique et pharmacie NorthWay.",
  body: `
<!-- INTERNAL NOTE: this policy must be reviewed and approved by NorthWay's
     compliance officer before the live site launches. Treat this text as a
     starting point, not a final policy. See ProjectDocs/Rules.md. -->
${pageHeader("Politique de confidentialité", "Comment nous utilisons vos renseignements.")}
<section class="reveal">
  <div class="container">
    <h3>Ce que nous recueillons</h3>
    <p>L'inscription recueille votre nom, genre, téléphone, courriel et adresse seulement — aucun renseignement de santé.</p>

    <h3>Utilisation</h3>
    <p>Notre personnel les examine pour confirmer votre inscription et réserver votre première visite.</p>

    <h3>Réservation</h3>
    <p>Les rendez-vous sont réservés via Medeo, notre partenaire de planification.</p>

    <h3>Questions</h3>
    <p>Contactez-nous à <a href="mailto:[ADRESSE COURRIEL]">[ADRESSE COURRIEL]</a>.</p>
  </div>
</section>
`
};

// ---------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------
function writeSite() {
  fs.mkdirSync(path.join(OUT, "en"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "fr"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "assets", "css"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "assets", "js"), { recursive: true });

  // Pages that used to live at their own URL but are now sections of another
  // page (see ProjectDocs/memory.md for the history of each merge). Keep a
  // thin meta-refresh redirect at the old filename so any old link/bookmark
  // still lands somewhere useful, instead of a straight 404.
  const RETIRED_REDIRECTS = {
    "register.html": "book-appointment.html",
    "urgent-care.html": "clinic-services.html#urgent-care",
    "long-term-care.html": "pharmacy-services.html#long-term-care",
    "visit-us.html": "about.html#visit-us",
    "team.html": "about.html#team"
  };

  [["en", pagesEn], ["fr", pagesFr]].forEach(([lang, pages]) => {
    Object.keys(pages).forEach(slug => {
      const p = pages[slug];
      let html = layout({ lang, slug, title: p.title, metaDesc: p.metaDesc, body: p.body });
      html = fixLangToggle(html, lang, slug);
      fs.writeFileSync(path.join(OUT, lang, slug + ".html"), html);
    });

    Object.entries(RETIRED_REDIRECTS).forEach(([oldFile, newTarget]) => {
      const destSlug = newTarget.split("#")[0];
      const destLabel = navLabel(T[lang], destSlug);
      const linkText = lang === "fr" ? `Continuer vers ${destLabel}` : `Continue to ${destLabel}`;
      fs.writeFileSync(path.join(OUT, lang, oldFile), `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=${newTarget}">
<title>NorthWay Clinic and Pharmacy</title>
</head>
<body>
<p><a href="${newTarget}">${linkText}</a></p>
</body>
</html>
`);
    });
  });

  fs.writeFileSync(path.join(OUT, "index.html"), `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url=en/index.html">
<title>NorthWay Clinic and Pharmacy</title>
</head>
<body>
<p>Redirecting to <a href="en/index.html">NorthWay Clinic and Pharmacy</a>…</p>
</body>
</html>
`);

  // Temporary demo domain — block it from being indexed so it never
  // competes with the real launch domain in search results. Remove this
  // file (or loosen it) once a real domain is live — see Rules.md.
  fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nDisallow: /\n`);

  // Custom 404 — GitHub Pages serves this automatically for any unmatched
  // URL. Bilingual since we don't know which language the visitor wanted.
  fs.writeFileSync(path.join(OUT, "404.html"), `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page Not Found — NorthWay Clinic and Pharmacy</title>
<meta name="robots" content="noindex, nofollow">
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="page-header">
  <div class="container">
    <div class="logo-mark" style="margin-bottom:18px;">${LOGO_MARK}</div>
    <h1>Page not found</h1>
    <p class="lede">That page doesn't exist — it may have moved.</p>
  </div>
</div>
<main>
  <section>
    <div class="container">
      <div class="btn-row">
        <a class="btn btn-primary" href="en/index.html">Go to homepage (English)</a>
        <a class="btn btn-secondary" href="fr/index.html">Aller à l'accueil (Français)</a>
      </div>
    </div>
  </section>
</main>
</body>
</html>
`);

  const redirectCount = Object.keys(RETIRED_REDIRECTS).length;
  console.log("Wrote", (Object.keys(pagesEn).length + redirectCount) * 2 + 2, "HTML files (+ robots.txt) to", OUT);
}

writeSite();
module.exports = { pagesEn, pagesFr, T };
