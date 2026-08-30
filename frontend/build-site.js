// NorthWay Clinic and Pharmacy — Phase 1 static site generator.
// Generates a plain HTML/CSS/JS site (no build step needed to host it).
// Run: node build-site.js   -> writes into ./{en,fr}/*.html and ./index.html
// (assets/css, assets/js are hand-maintained, not generated — this script
// only creates the directories for them if missing, it never overwrites them)

const fs = require("fs");
const path = require("path");

const OUT = __dirname;

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
      ["register.html", "Register"],
      ["book-appointment.html", "Book an Appointment"],
      ["clinic-services.html", "Clinic Services"],
      ["pharmacy-services.html", "Pharmacy Services"],
      ["long-term-care.html", "Long-Term Care"],
      ["visit-us.html", "Visit Us"],
      ["urgent-care.html", "Urgent Care"],
      ["about.html", "About"]
    ],
    langLabel: "EN", otherLangLabel: "FR", otherLangName: "Français",
    footerHours: "Hours",
    footerHoursLines: ["Mon–Fri: 10:00 am – 6:00 pm", "Saturday: 10:00 am – 2:00 pm", "Sunday: Closed"],
    footerQuick: "Quick Links",
    footerContact: "Contact",
    footerAddress: "[STREET ADDRESS], Cornwall, ON [POSTAL CODE]",
    privacy: "Privacy Policy",
    rights: "NorthWay Clinic and Pharmacy. All rights reserved.",
    skip: "Skip to main content",
    emergencyBanner: "Medical emergency? Call 911 or go to Cornwall Community Hospital's Emergency Department."
  },
  fr: {
    dir: "fr", htmlLang: "fr",
    phone: "[NUMÉRO DE TÉLÉPHONE]",
    badge: "Nous acceptons de nouveaux patients",
    nav: [
      ["index.html", "Accueil"],
      ["register.html", "Inscription"],
      ["book-appointment.html", "Prendre rendez-vous"],
      ["clinic-services.html", "Services de la clinique"],
      ["pharmacy-services.html", "Services de la pharmacie"],
      ["long-term-care.html", "Soins de longue durée"],
      ["visit-us.html", "Nous visiter"],
      ["urgent-care.html", "Soins urgents"],
      ["about.html", "À propos"]
    ],
    langLabel: "FR", otherLangLabel: "EN", otherLangName: "English",
    footerHours: "Heures d'ouverture",
    footerHoursLines: ["Lun–Ven : 10 h – 18 h", "Samedi : 10 h – 14 h", "Dimanche : fermé"],
    footerQuick: "Liens rapides",
    footerContact: "Coordonnées",
    footerAddress: "[ADRESSE], Cornwall, ON [CODE POSTAL]",
    privacy: "Politique de confidentialité",
    rights: "Clinique et pharmacie NorthWay. Tous droits réservés.",
    skip: "Passer au contenu principal",
    emergencyBanner: "Urgence médicale? Composez le 911 ou rendez-vous aux urgences de l'Hôpital communautaire de Cornwall."
  }
};

// ---------------------------------------------------------------------
// Shared markup helpers
// ---------------------------------------------------------------------
function layout({ lang, slug, title, metaDesc, body }) {
  const t = T[lang];
  const navLinks = t.nav.map(([href, label]) => {
    const current = href === slug + ".html";
    return `<li><a href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a></li>`;
  }).join("\n            ");

  return `<!DOCTYPE html>
<html lang="${t.htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — NorthWay Clinic and Pharmacy</title>
<meta name="description" content="${metaDesc}">
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
<a class="skip-link" href="#main">${t.skip}</a>

<div class="topbar">
  <div class="container">
    <span class="badge">${t.badge}</span>
    <div style="display:flex; align-items:center; gap:18px;">
      <a href="tel:${t.phone.replace(/[^0-9+]/g, "") || "#"}">${t.phone}</a>
      <span class="lang-toggle"></span>
    </div>
  </div>
</div>

<header class="site-header">
  <div class="container header-inner">
    <a class="wordmark" href="index.html">NorthWay<span>Clinic &amp; Pharmacy</span></a>
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
          <li><a href="register.html">${t.nav[1][1]}</a></li>
          <li><a href="book-appointment.html">${t.nav[2][1]}</a></li>
          <li><a href="urgent-care.html">${t.nav[7][1]}</a></li>
          <li><a href="visit-us.html">${t.nav[6][1]}</a></li>
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

function card(title, text) {
  return `<div class="card"><h3>${title}</h3><p>${text}</p></div>`;
}

function heroSection({ h1, lede, primary, secondary }) {
  return `<section class="hero">
    <div class="container">
      <h1>${h1}</h1>
      <p class="lede">${lede}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="${primary.href}">${primary.label}</a>
        <a class="btn btn-secondary" href="${secondary.href}">${secondary.label}</a>
      </div>
    </div>
  </section>`;
}

function pageHeader(h1, lede) {
  return `<div class="page-header"><div class="container"><h1>${h1}</h1><p class="lede">${lede}</p></div></div>`;
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
  h1: "Family medicine and pharmacy care, together, in Cornwall.",
  lede: "NorthWay Clinic and Pharmacy brings a family physician practice, walk-in and urgent care, and a full-service pharmacy under one roof — built for patients of every age.",
  primary: { href: "register.html", label: "Register as a New Patient" },
  secondary: { href: "book-appointment.html", label: "Book an Appointment" }
})}

<section>
  <div class="container">
    <h2>What we offer</h2>
    <div class="card-grid">
      ${card("Family &amp; Walk-In Clinic", "Rostered family physician care alongside walk-in and urgent care for when you can't wait. <a href=\"clinic-services.html\">See clinic services →</a>")}
      ${card("Pharmacy Services", "Retail dispensing, vaccinations, and blister/compliance packaging. <a href=\"pharmacy-services.html\">See pharmacy services →</a>")}
      ${card("Long-Term Care Support", "Dedicated packaging and delivery coordination for care homes and retirement residences. <a href=\"long-term-care.html\">Learn more →</a>")}
      ${card("Bilingual Service", "Full service in English and French, in person and online.")}
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="strip">
      <div class="block"><h3>Hours</h3><p>Mon–Fri: 10 am – 6 pm<br>Saturday: 10 am – 2 pm</p></div>
      <div class="block"><h3>Location</h3><p>[STREET ADDRESS], Cornwall, ON. Paid parking on-site.</p></div>
      <div class="block"><h3>Phone</h3><p><a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a></p></div>
      <div class="block"><a class="btn btn-secondary" href="visit-us.html">Get directions</a></div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="callout info">
      <h2>New to NorthWay?</h2>
      <p>Registering takes a few minutes. A team member will reach out to confirm your details and get you booked in.</p>
      <a class="btn btn-primary" href="register.html">Start your registration</a>
    </div>
  </div>
</section>
`
};

pagesEn.register = {
  title: "Register as a New Patient",
  metaDesc: "Register as a new patient at NorthWay Clinic and Pharmacy.",
  body: `
${pageHeader("Register as a New Patient", "This short form collects your contact details only — it is not a medical record. A staff member reviews every submission and follows up to complete your registration.")}
<section>
  <div class="container">
    <div class="form-note">
      <strong>What happens after you submit:</strong> our team reviews your details, adds you to our patient system, and either calls you or emails you a link to book your first appointment. No health information is collected on this page — that's gathered securely once you're an active patient.
    </div>

    <form class="stack" id="register-form" novalidate>
      <div class="field">
        <label for="reg-for">Who is this registration for?</label>
        <select id="reg-for" name="registeringFor" required>
          <option value="">Select one</option>
          <option value="self">Myself</option>
          <option value="dependent">My child or a dependent</option>
        </select>
        <p class="hint">If you're registering a minor or a dependent, a parent or guardian must complete this form.</p>
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
          <label><input type="radio" name="gender" value="other"> Other / prefer to self-describe</label>
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
        <label for="consent">I consent to being contacted by phone, email, or text message to complete my registration and to receive appointment-related messages.</label>
      </div>

      <button type="submit" class="btn btn-primary">Submit Registration</button>
      <p class="hint" id="form-error" hidden>Something went wrong submitting your registration. Please call us at <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a> instead.</p>
    </form>

    <div class="callout info" id="form-confirmation" hidden>
      <h2>Thank you</h2>
      <p>Your registration has been received. Our team will contact you shortly to confirm your details and help you book your first appointment.</p>
    </div>
  </div>
</section>
`
};

pagesEn["book-appointment"] = {
  title: "Book an Appointment",
  metaDesc: "Book an appointment online through Medeo.",
  body: `
${pageHeader("Book an Appointment", "Once you're a registered patient, booking is quick and secure through our online scheduling partner, Medeo.")}
<section>
  <div class="container">
    <div class="card" style="max-width:640px;">
      <h3>Book online with Medeo</h3>
      <p>Select a provider, pick an available time, and get an instant confirmation by email.</p>
      <a class="btn btn-primary" href="#" aria-disabled="true">Open Medeo Booking</a>
      <p class="hint">[LINK PLACEHOLDER — insert the practice's live Medeo booking URL before launch.]</p>
    </div>

    <div class="callout warn" style="margin-top:28px;">
      <h3>Need to be seen urgently?</h3>
      <p>Online booking isn't the right tool for urgent symptoms. See our <a href="urgent-care.html">Urgent Care Guidance</a> for what to do instead.</p>
    </div>

    <div class="callout draft" style="margin-top:28px;">
      <span class="draft-label">Not registered yet?</span>
      <p><a href="register.html">Register as a new patient</a> first — Medeo bookings are for active patients in our system.</p>
    </div>
  </div>
</section>
`
};

pagesEn["clinic-services"] = {
  title: "Clinic Services",
  metaDesc: "Family physician, walk-in, and urgent care services at NorthWay Clinic.",
  body: `
${pageHeader("Clinic Services", "Rostered family medicine alongside walk-in and urgent care, for patients of every age.")}
<section>
  <div class="container">
    <div class="card-grid">
      <div class="card">
        <h3>Family Physician Care</h3>
        <p>Ongoing, rostered care with a consistent physician — annual check-ups, chronic disease management, referrals, and preventive care.</p>
        <p><span class="placeholder">Accepting new patients: [STATUS]</span></p>
      </div>
      <div class="card">
        <h3>Walk-In &amp; Urgent Care</h3>
        <p>For same-day concerns that can't wait for a scheduled appointment — minor illness and injury, prescription renewals, and general health concerns.</p>
      </div>
    </div>

    <div class="callout info" style="margin-top:28px;">
      <h3>What to bring to your visit</h3>
      <p>Your health card (OHIP), a list of current medications, and any referral paperwork you've been given.</p>
    </div>

    <div class="btn-row">
      <a class="btn btn-primary" href="register.html">Register as a New Patient</a>
      <a class="btn btn-secondary" href="book-appointment.html">Book an Appointment</a>
    </div>
  </div>
</section>
`
};

pagesEn["pharmacy-services"] = {
  title: "Pharmacy Services",
  metaDesc: "Retail dispensing, vaccinations, and compliance packaging at NorthWay Pharmacy.",
  body: `
${pageHeader("Pharmacy Services", "Full-service dispensing, vaccinations, and packaging support, in one location with your clinic team.")}
<section>
  <div class="container">
    <div class="card-grid">
      ${card("Retail Dispensing", "Prescription filling with pharmacist consultation for every new medication.")}
      ${card("Vaccinations", "Seasonal and travel vaccinations administered by our pharmacy team.")}
      ${card("Blister / Compliance Packaging", "Medications organized by date and time to help you stay on track.")}
      ${card("Long-Term Care &amp; Retirement Homes", "Packaging and delivery coordination for facility partners. <a href=\"long-term-care.html\">Learn more →</a>")}
    </div>

    <div class="callout draft" style="margin-top:28px;">
      <span class="draft-label">Coming soon</span>
      <p>Online prescription refill and transfer requests are planned for a future update. For now, please call the pharmacy directly at <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a> to arrange a refill or transfer.</p>
    </div>
  </div>
</section>
`
};

pagesEn["long-term-care"] = {
  title: "Long-Term Care & Retirement Homes",
  metaDesc: "Pharmacy partnership services for long-term care homes and retirement residences.",
  body: `
${pageHeader("Long-Term Care & Retirement Homes", "A dedicated pharmacy partnership for care homes and retirement residences in the Cornwall area.")}
<section>
  <div class="container">
    <div class="card-grid">
      ${card("Compliance Packaging", "Medications packaged by resident, date, and time to simplify administration for care staff.")}
      ${card("Scheduled Delivery", "Coordinated delivery schedules built around your facility's routine.")}
      ${card("Dedicated Pharmacist Liaison", "A single point of contact for medication questions, changes, and reconciliation.")}
    </div>
    <div class="callout info" style="margin-top:28px;">
      <h3>Interested in a partnership?</h3>
      <p>Contact us at <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a> or <a href="mailto:[EMAIL ADDRESS]">[EMAIL ADDRESS]</a> to discuss your facility's needs.</p>
    </div>
  </div>
</section>
`
};

pagesEn["visit-us"] = {
  title: "Visit Us",
  metaDesc: "Hours, location, parking, and contact information for NorthWay Clinic and Pharmacy.",
  body: `
${pageHeader("Visit Us", "Hours, location, and how to reach us.")}
<section>
  <div class="container">
    <div class="card-grid">
      <div class="card">
        <h3>Hours</h3>
        <table class="hours">
          <tr><td>Monday – Friday</td><td>10:00 am – 6:00 pm</td></tr>
          <tr><td>Saturday</td><td>10:00 am – 2:00 pm</td></tr>
          <tr><td>Sunday</td><td>Closed</td></tr>
        </table>
      </div>
      <div class="card">
        <h3>Location &amp; Parking</h3>
        <p>[STREET ADDRESS], Cornwall, ON [POSTAL CODE]</p>
        <p>Paid parking is available on-site.</p>
        <p class="hint">[MAP EMBED PLACEHOLDER]</p>
      </div>
      <div class="card">
        <h3>Contact</h3>
        <p>Phone: <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a></p>
        <p>Email: <a href="mailto:[EMAIL ADDRESS]">[EMAIL ADDRESS]</a></p>
      </div>
    </div>
  </div>
</section>
`
};

pagesEn["urgent-care"] = {
  title: "Urgent Care Guidance",
  metaDesc: "What to do for urgent, non-emergency needs, and when to seek emergency care instead.",
  body: `
${pageHeader("Urgent Care Guidance", "How to reach us for urgent (non-emergency) needs — and when to seek emergency care instead.")}
<section>
  <div class="container">
    <div class="callout warn">
      <h2>If this is a medical emergency</h2>
      <p><strong>Call 911</strong> or go directly to the Emergency Department at Cornwall Community Hospital. Do not wait for a callback or email response.</p>
    </div>

    <div class="card-grid" style="margin-top:28px;">
      <div class="card">
        <h3>Urgent, but not an emergency, during our hours</h3>
        <p>Call us directly at <a href="tel:[PHONE NUMBER]">[PHONE NUMBER]</a>. Our walk-in and urgent care service can often see you the same day.</p>
      </div>
      <div class="card">
        <h3>Outside of our hours</h3>
        <p>Call Health811 (dial 8-1-1) for free health advice from a registered nurse, any time, day or night.</p>
      </div>
    </div>

    <div class="callout draft" style="margin-top:28px;">
      <span class="draft-label">Note</span>
      <p>Our contact form and email are not monitored around the clock. Please do not use them to describe an urgent or emergency symptom — call us, call Health811, or go to the Emergency Department instead.</p>
    </div>
  </div>
</section>
`
};

pagesEn.about = {
  title: "About Us",
  metaDesc: "About NorthWay Clinic and Pharmacy in Cornwall, Ontario.",
  body: `
${pageHeader("About NorthWay", "A community-focused clinic and pharmacy, built around the people we serve.")}
<section>
  <div class="container">
    <div class="callout draft">
      <span class="draft-label">Placeholder content</span>
      <p>[Practice story / mission statement to be provided — a few sentences on why NorthWay was founded and what makes it different, in a warm, community-oriented voice.]</p>
    </div>

    <h2 style="margin-top:36px;">Our Team</h2>
    <div class="card-grid">
      ${card("[Provider Name]", "[Credentials] · [Languages spoken] · Accepting new patients: [STATUS]")}
      ${card("[Provider Name]", "[Credentials] · [Languages spoken] · Accepting new patients: [STATUS]")}
      ${card("[Pharmacist Name]", "[Credentials] · [Languages spoken]")}
    </div>
    <p class="hint" style="margin-top:16px;">Provider bios and photos pending — see the handoff notes for what's needed.</p>
  </div>
</section>
`
};

pagesEn["privacy-policy"] = {
  title: "Privacy Policy",
  metaDesc: "Privacy policy for NorthWay Clinic and Pharmacy.",
  body: `
${pageHeader("Privacy Policy", "How we handle information submitted through this website.")}
<section>
  <div class="container">
    <div class="callout draft">
      <span class="draft-label">Draft — pending compliance review</span>
      <p>This page must be reviewed and approved by NorthWay's compliance officer and, if needed, a privacy advisor before the site goes live. The text below is a starting point, not a final policy.</p>
    </div>

    <div style="margin-top:24px;">
      <h3>What this website collects</h3>
      <p>Our registration form collects your name, gender, phone number, email address, and home address only. This website does not collect or store any health information. Clinical information is collected separately, in person or through our clinic's electronic medical record system, once you are a registered patient.</p>

      <h3>How your information is used</h3>
      <p>Submitted registration details are reviewed by our staff, used to add you to our patient records system, and used to contact you to complete your registration and book your first appointment.</p>

      <h3>Appointment booking</h3>
      <p>Appointment booking is handled through Medeo, our third-party scheduling partner, which has its own privacy practices.</p>

      <h3>Questions about this policy</h3>
      <p>Contact our privacy officer at <a href="mailto:[EMAIL ADDRESS]">[EMAIL ADDRESS]</a>.</p>
    </div>
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
  h1: "Médecine familiale et soins pharmaceutiques, réunis, à Cornwall.",
  lede: "La Clinique et pharmacie NorthWay regroupe une pratique de médecine familiale, des soins sans rendez-vous et une pharmacie complète sous un même toit — pour les patients de tous âges.",
  primary: { href: "register.html", label: "S'inscrire comme nouveau patient" },
  secondary: { href: "book-appointment.html", label: "Prendre rendez-vous" }
})}

<section>
  <div class="container">
    <h2>Nos services</h2>
    <div class="card-grid">
      ${card("Clinique familiale et sans rendez-vous", "Soins médicaux familiaux continus, ainsi que des soins sans rendez-vous pour les besoins urgents. <a href=\"clinic-services.html\">Voir les services de la clinique →</a>")}
      ${card("Services de pharmacie", "Distribution de médicaments, vaccinations et emballage-coque de conformité. <a href=\"pharmacy-services.html\">Voir les services de la pharmacie →</a>")}
      ${card("Soutien aux soins de longue durée", "Emballage et coordination de livraison pour les foyers de soins et résidences pour retraités. <a href=\"long-term-care.html\">En savoir plus →</a>")}
      ${card("Service bilingue", "Service complet en français et en anglais, en personne et en ligne.")}
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="strip">
      <div class="block"><h3>Heures</h3><p>Lun–Ven : 10 h – 18 h<br>Samedi : 10 h – 14 h</p></div>
      <div class="block"><h3>Emplacement</h3><p>[ADRESSE], Cornwall, ON. Stationnement payant sur place.</p></div>
      <div class="block"><h3>Téléphone</h3><p><a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a></p></div>
      <div class="block"><a class="btn btn-secondary" href="visit-us.html">Obtenir l'itinéraire</a></div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="callout info">
      <h2>Nouveau chez NorthWay?</h2>
      <p>L'inscription ne prend que quelques minutes. Un membre de notre équipe communiquera avec vous pour confirmer vos renseignements et planifier votre rendez-vous.</p>
      <a class="btn btn-primary" href="register.html">Commencer mon inscription</a>
    </div>
  </div>
</section>
`
};

pagesFr.register = {
  title: "S'inscrire comme nouveau patient",
  metaDesc: "Inscrivez-vous comme nouveau patient à la Clinique et pharmacie NorthWay.",
  body: `
${pageHeader("S'inscrire comme nouveau patient", "Ce court formulaire recueille uniquement vos coordonnées — ce n'est pas un dossier médical. Un membre du personnel examine chaque soumission et communique avec vous pour compléter votre inscription.")}
<section>
  <div class="container">
    <div class="form-note">
      <strong>Ce qui se passe après l'envoi :</strong> notre équipe examine vos renseignements, vous ajoute à notre système de patients, puis vous appelle ou vous envoie un courriel avec un lien pour réserver votre premier rendez-vous. Aucun renseignement de santé n'est recueilli sur cette page — cela se fait de façon sécurisée une fois que vous êtes un patient actif.
    </div>

    <form class="stack" id="register-form" novalidate>
      <div class="field">
        <label for="reg-for">Pour qui est cette inscription?</label>
        <select id="reg-for" name="registeringFor" required>
          <option value="">Choisir une option</option>
          <option value="self">Moi-même</option>
          <option value="dependent">Mon enfant ou une personne à charge</option>
        </select>
        <p class="hint">Si vous inscrivez un mineur ou une personne à charge, un parent ou tuteur doit remplir ce formulaire.</p>
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
          <label><input type="radio" name="gender" value="other"> Autre / je préfère préciser</label>
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
        <label for="consent">Je consens à être contacté(e) par téléphone, courriel ou message texte pour compléter mon inscription et recevoir des messages liés à mes rendez-vous.</label>
      </div>

      <button type="submit" class="btn btn-primary">Soumettre l'inscription</button>
      <p class="hint" id="form-error" hidden>Une erreur est survenue lors de l'envoi. Veuillez nous appeler au <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a>.</p>
    </form>

    <div class="callout info" id="form-confirmation" hidden>
      <h2>Merci</h2>
      <p>Votre inscription a été reçue. Notre équipe communiquera avec vous sous peu pour confirmer vos renseignements et planifier votre premier rendez-vous.</p>
    </div>
  </div>
</section>
`
};

pagesFr["book-appointment"] = {
  title: "Prendre rendez-vous",
  metaDesc: "Prenez rendez-vous en ligne grâce à Medeo.",
  body: `
${pageHeader("Prendre rendez-vous", "Une fois inscrit(e) comme patient, la prise de rendez-vous est rapide et sécurisée grâce à notre partenaire de planification en ligne, Medeo.")}
<section>
  <div class="container">
    <div class="card" style="max-width:640px;">
      <h3>Réserver en ligne avec Medeo</h3>
      <p>Choisissez un professionnel de la santé, sélectionnez une heure disponible et recevez une confirmation instantanée par courriel.</p>
      <a class="btn btn-primary" href="#" aria-disabled="true">Ouvrir Medeo</a>
      <p class="hint">[ESPACE RÉSERVÉ AU LIEN — insérer l'URL de réservation Medeo réelle avant le lancement.]</p>
    </div>

    <div class="callout warn" style="margin-top:28px;">
      <h3>Besoin de soins urgents?</h3>
      <p>La réservation en ligne n'est pas l'outil approprié pour des symptômes urgents. Consultez notre page <a href="urgent-care.html">Soins urgents</a> pour savoir quoi faire.</p>
    </div>

    <div class="callout draft" style="margin-top:28px;">
      <span class="draft-label">Pas encore inscrit(e)?</span>
      <p><a href="register.html">Inscrivez-vous comme nouveau patient</a> d'abord — les réservations Medeo sont réservées aux patients actifs de notre système.</p>
    </div>
  </div>
</section>
`
};

pagesFr["clinic-services"] = {
  title: "Services de la clinique",
  metaDesc: "Médecine familiale, soins sans rendez-vous et soins urgents à la Clinique NorthWay.",
  body: `
${pageHeader("Services de la clinique", "Médecine familiale continue, ainsi que des soins sans rendez-vous et urgents, pour les patients de tous âges.")}
<section>
  <div class="container">
    <div class="card-grid">
      <div class="card">
        <h3>Soins de médecine familiale</h3>
        <p>Soins continus avec un médecin attitré — bilans annuels, gestion des maladies chroniques, orientations et soins préventifs.</p>
        <p><span class="placeholder">Accepte de nouveaux patients : [STATUT]</span></p>
      </div>
      <div class="card">
        <h3>Soins sans rendez-vous et urgents</h3>
        <p>Pour les besoins qui ne peuvent pas attendre un rendez-vous planifié — maladies et blessures mineures, renouvellements d'ordonnances et préoccupations générales de santé.</p>
      </div>
    </div>

    <div class="callout info" style="margin-top:28px;">
      <h3>Quoi apporter à votre visite</h3>
      <p>Votre carte santé (OHIP), une liste de vos médicaments actuels et tout document de référence qui vous a été remis.</p>
    </div>

    <div class="btn-row">
      <a class="btn btn-primary" href="register.html">S'inscrire comme nouveau patient</a>
      <a class="btn btn-secondary" href="book-appointment.html">Prendre rendez-vous</a>
    </div>
  </div>
</section>
`
};

pagesFr["pharmacy-services"] = {
  title: "Services de la pharmacie",
  metaDesc: "Distribution de médicaments, vaccinations et emballage de conformité à la Pharmacie NorthWay.",
  body: `
${pageHeader("Services de la pharmacie", "Distribution complète de médicaments, vaccinations et soutien à l'emballage, au même endroit que votre équipe clinique.")}
<section>
  <div class="container">
    <div class="card-grid">
      ${card("Distribution de médicaments", "Préparation d'ordonnances avec consultation d'un pharmacien pour chaque nouveau médicament.")}
      ${card("Vaccinations", "Vaccinations saisonnières et de voyage administrées par notre équipe de pharmacie.")}
      ${card("Emballage-coque de conformité", "Médicaments organisés par date et heure pour vous aider à respecter votre traitement.")}
      ${card("Soins de longue durée et résidences pour retraités", "Emballage et coordination de livraison pour nos partenaires. <a href=\"long-term-care.html\">En savoir plus →</a>")}
    </div>

    <div class="callout draft" style="margin-top:28px;">
      <span class="draft-label">À venir</span>
      <p>Les demandes de renouvellement et de transfert d'ordonnances en ligne sont prévues pour une mise à jour future. Pour l'instant, veuillez appeler directement la pharmacie au <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a> pour un renouvellement ou un transfert.</p>
    </div>
  </div>
</section>
`
};

pagesFr["long-term-care"] = {
  title: "Soins de longue durée et résidences pour retraités",
  metaDesc: "Services de partenariat en pharmacie pour les foyers de soins de longue durée et résidences pour retraités.",
  body: `
${pageHeader("Soins de longue durée et résidences pour retraités", "Un partenariat pharmaceutique dédié aux foyers de soins et résidences pour retraités de la région de Cornwall.")}
<section>
  <div class="container">
    <div class="card-grid">
      ${card("Emballage de conformité", "Médicaments emballés par résident, date et heure pour simplifier l'administration par le personnel soignant.")}
      ${card("Livraison planifiée", "Horaires de livraison coordonnés selon la routine de votre établissement.")}
      ${card("Pharmacien de liaison dédié", "Un seul point de contact pour les questions de médicaments, les changements et la conciliation.")}
    </div>
    <div class="callout info" style="margin-top:28px;">
      <h3>Intéressé par un partenariat?</h3>
      <p>Contactez-nous au <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a> ou à <a href="mailto:[ADRESSE COURRIEL]">[ADRESSE COURRIEL]</a> pour discuter des besoins de votre établissement.</p>
    </div>
  </div>
</section>
`
};

pagesFr["visit-us"] = {
  title: "Nous visiter",
  metaDesc: "Heures, emplacement, stationnement et coordonnées de la Clinique et pharmacie NorthWay.",
  body: `
${pageHeader("Nous visiter", "Heures, emplacement et comment nous joindre.")}
<section>
  <div class="container">
    <div class="card-grid">
      <div class="card">
        <h3>Heures d'ouverture</h3>
        <table class="hours">
          <tr><td>Lundi – Vendredi</td><td>10 h – 18 h</td></tr>
          <tr><td>Samedi</td><td>10 h – 14 h</td></tr>
          <tr><td>Dimanche</td><td>Fermé</td></tr>
        </table>
      </div>
      <div class="card">
        <h3>Emplacement et stationnement</h3>
        <p>[ADRESSE], Cornwall, ON [CODE POSTAL]</p>
        <p>Stationnement payant disponible sur place.</p>
        <p class="hint">[ESPACE RÉSERVÉ POUR CARTE]</p>
      </div>
      <div class="card">
        <h3>Coordonnées</h3>
        <p>Téléphone : <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a></p>
        <p>Courriel : <a href="mailto:[ADRESSE COURRIEL]">[ADRESSE COURRIEL]</a></p>
      </div>
    </div>
  </div>
</section>
`
};

pagesFr["urgent-care"] = {
  title: "Soins urgents",
  metaDesc: "Que faire pour des besoins urgents, non urgents, et quand consulter les urgences.",
  body: `
${pageHeader("Soins urgents", "Comment nous joindre pour des besoins urgents (non-urgences) — et quand consulter les urgences plutôt.")}
<section>
  <div class="container">
    <div class="callout warn">
      <h2>En cas d'urgence médicale</h2>
      <p><strong>Composez le 911</strong> ou rendez-vous directement aux urgences de l'Hôpital communautaire de Cornwall. N'attendez pas un rappel ou une réponse par courriel.</p>
    </div>

    <div class="card-grid" style="margin-top:28px;">
      <div class="card">
        <h3>Urgent, mais pas une urgence, pendant nos heures</h3>
        <p>Appelez-nous directement au <a href="tel:[NUMÉRO DE TÉLÉPHONE]">[NUMÉRO DE TÉLÉPHONE]</a>. Notre service sans rendez-vous peut souvent vous recevoir le jour même.</p>
      </div>
      <div class="card">
        <h3>En dehors de nos heures</h3>
        <p>Composez Health811 (le 8-1-1) pour des conseils de santé gratuits d'une infirmière autorisée, en tout temps.</p>
      </div>
    </div>

    <div class="callout draft" style="margin-top:28px;">
      <span class="draft-label">Remarque</span>
      <p>Notre formulaire de contact et notre courriel ne sont pas surveillés en tout temps. Veuillez ne pas les utiliser pour décrire un symptôme urgent ou une urgence — appelez-nous, composez Health811, ou rendez-vous aux urgences.</p>
    </div>
  </div>
</section>
`
};

pagesFr.about = {
  title: "À propos",
  metaDesc: "À propos de la Clinique et pharmacie NorthWay à Cornwall, en Ontario.",
  body: `
${pageHeader("À propos de NorthWay", "Une clinique et pharmacie axées sur la communauté, bâties autour des gens que nous servons.")}
<section>
  <div class="container">
    <div class="callout draft">
      <span class="draft-label">Contenu provisoire</span>
      <p>[Histoire de la pratique / énoncé de mission à fournir — quelques phrases sur les origines de NorthWay et ce qui la distingue, dans un ton chaleureux et communautaire.]</p>
    </div>

    <h2 style="margin-top:36px;">Notre équipe</h2>
    <div class="card-grid">
      ${card("[Nom du fournisseur]", "[Titres] · [Langues parlées] · Accepte de nouveaux patients : [STATUT]")}
      ${card("[Nom du fournisseur]", "[Titres] · [Langues parlées] · Accepte de nouveaux patients : [STATUT]")}
      ${card("[Nom du pharmacien]", "[Titres] · [Langues parlées]")}
    </div>
    <p class="hint" style="margin-top:16px;">Biographies et photos des fournisseurs à venir — voir les notes de transfert pour ce qui est requis.</p>
  </div>
</section>
`
};

pagesFr["privacy-policy"] = {
  title: "Politique de confidentialité",
  metaDesc: "Politique de confidentialité de la Clinique et pharmacie NorthWay.",
  body: `
${pageHeader("Politique de confidentialité", "Comment nous traitons les renseignements soumis via ce site web.")}
<section>
  <div class="container">
    <div class="callout draft">
      <span class="draft-label">Ébauche — en attente d'examen de conformité</span>
      <p>Cette page doit être examinée et approuvée par le responsable de la conformité de NorthWay et, si nécessaire, un conseiller en protection de la vie privée avant la mise en ligne du site. Le texte ci-dessous est un point de départ, pas une politique finale.</p>
    </div>

    <div style="margin-top:24px;">
      <h3>Ce que ce site web recueille</h3>
      <p>Notre formulaire d'inscription recueille uniquement votre nom, votre genre, votre numéro de téléphone, votre adresse courriel et votre adresse résidentielle. Ce site web ne recueille ni ne conserve aucun renseignement de santé. Les renseignements cliniques sont recueillis séparément, en personne ou dans le dossier médical électronique de la clinique, une fois que vous êtes un patient inscrit.</p>

      <h3>Utilisation de vos renseignements</h3>
      <p>Les renseignements d'inscription soumis sont examinés par notre personnel, utilisés pour vous ajouter à notre système de dossiers de patients, et utilisés pour communiquer avec vous afin de compléter votre inscription et de réserver votre premier rendez-vous.</p>

      <h3>Réservation de rendez-vous</h3>
      <p>La réservation de rendez-vous est gérée par Medeo, notre partenaire de planification tiers, qui a ses propres pratiques de confidentialité.</p>

      <h3>Questions sur cette politique</h3>
      <p>Contactez notre responsable de la protection de la vie privée à <a href="mailto:[ADRESSE COURRIEL]">[ADRESSE COURRIEL]</a>.</p>
    </div>
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

  [["en", pagesEn], ["fr", pagesFr]].forEach(([lang, pages]) => {
    Object.keys(pages).forEach(slug => {
      const p = pages[slug];
      let html = layout({ lang, slug, title: p.title, metaDesc: p.metaDesc, body: p.body });
      html = fixLangToggle(html, lang, slug);
      fs.writeFileSync(path.join(OUT, lang, slug + ".html"), html);
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

  console.log("Wrote", Object.keys(pagesEn).length * 2 + 1, "HTML files to", OUT);
}

writeSite();
module.exports = { pagesEn, pagesFr, T };
