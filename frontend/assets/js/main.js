// NorthWay Clinic and Pharmacy — shared front-end behaviour (Phase 1)
// No analytics, no third-party trackers. This file talks to exactly one
// backend endpoint (registration submissions) and nothing else.

document.addEventListener("DOMContentLoaded", function () {
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Top banner ("Accepting new patients"): the build-time string in the
  // HTML is a no-JS fallback. Fetch the live value so staff can change it
  // from the admin page without a developer re-running the site build.
  var badge = document.querySelector("#site-badge");
  if (badge) {
    var apiBase0 = window.NORTHWAY_API_BASE || "";
    var badgeLang = document.documentElement.lang === "fr" ? "fr" : "en";
    fetch(apiBase0 + "/api/settings")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var banner = data && data.banner;
        if (!banner) return;
        if (!banner.enabled) {
          badge.hidden = true;
          return;
        }
        var text = badgeLang === "fr" ? banner.textFr : banner.textEn;
        if (text) badge.textContent = text;
      })
      .catch(function () {
        // Leave the build-time fallback text in place if the backend is
        // unreachable — never show a blank banner.
      });
  }

  // Sticky header: add a shadow once the page has scrolled a little.
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // One-time scroll-reveal for major sections. Respects reduced-motion by
  // simply not hiding anything to begin with (see prefersReducedMotion check).
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("nav.main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // Registration form: client-side validation, then POST to the backend.
  var form = document.querySelector("#register-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var required = form.querySelectorAll("[required]");
      var valid = true;
      required.forEach(function (field) {
        if (!field.value || (field.type === "checkbox" && !field.checked)) {
          valid = false;
          field.classList.add("invalid");
        } else {
          field.classList.remove("invalid");
        }
      });

      var confirmation = document.querySelector("#form-confirmation");
      var errorNote = document.querySelector("#form-error");
      if (errorNote) errorNote.hidden = true;

      if (!valid) {
        if (confirmation) confirmation.hidden = true;
        return;
      }

      var payload = {
        registeringFor: form.querySelector('[name="registeringFor"]').value,
        fullName: form.querySelector('[name="fullName"]').value,
        gender: (form.querySelector('[name="gender"]:checked') || {}).value || "",
        phone: form.querySelector('[name="phone"]').value,
        email: form.querySelector('[name="email"]').value,
        address: form.querySelector('[name="address"]').value,
        preferredLanguage: form.querySelector('[name="preferredLanguage"]').value,
        consent: form.querySelector('[name="consent"]').checked
      };

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.originalText = submitBtn.textContent; submitBtn.textContent = "Submitting…"; }

      var apiBase = window.NORTHWAY_API_BASE || "";

      fetch(apiBase + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed: " + res.status);
          return res.json();
        })
        .then(function () {
          form.hidden = true;
          if (confirmation) confirmation.hidden = false;
        })
        .catch(function (err) {
          console.error("Registration submission failed:", err);
          if (errorNote) errorNote.hidden = false;
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.originalText; }
        });
    });
  }

  // Team page: fetch the roster from the backend and render it client-side,
  // so an admin edit shows up immediately without regenerating the static site.
  var teamList = document.querySelector("#team-list");
  if (teamList) {
    var apiBase2 = window.NORTHWAY_API_BASE || "";
    var lang = document.documentElement.lang === "fr" ? "fr" : "en";
    var strings = lang === "fr"
      ? { accepting: "Accepte de nouveaux patients", notAccepting: "N'accepte pas de nouveaux patients", empty: "Les profils de notre équipe seront ajoutés sous peu.", error: "Impossible de charger l'équipe pour le moment." }
      : { accepting: "Accepting new patients", notAccepting: "Not currently accepting new patients", empty: "Team profiles are coming soon.", error: "Couldn't load the team list right now." };

    function initials(name) {
      return (name || "").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join("");
    }

    function escapeHtml(s) {
      return String(s || "").replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    fetch(apiBase2 + "/api/team")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var team = data.team || [];
        if (!team.length) {
          teamList.innerHTML = "<p>" + strings.empty + "</p>";
          return;
        }
        teamList.innerHTML = team.map(function (m) {
          var avatar = m.photoUrl
            ? "<div class='avatar'><img src='" + escapeHtml(m.photoUrl) + "' alt=''></div>"
            : "<div class='avatar'>" + escapeHtml(initials(m.name)) + "</div>";
          var pill = m.acceptingNewPatients
            ? "<span class='pill pill-yes'>" + strings.accepting + "</span>"
            : "<span class='pill pill-no'>" + strings.notAccepting + "</span>";
          return "<div class='provider-card'>" + avatar +
            "<div class='provider-info'>" +
              "<h3>" + escapeHtml(m.name) + "</h3>" +
              "<div class='provider-role'>" + escapeHtml(m.role) + "</div>" +
              "<div class='provider-meta'>" + escapeHtml(m.credentials) + (m.languages ? " · " + escapeHtml(m.languages) : "") + "</div>" +
              "<p>" + escapeHtml(m.bio) + "</p>" +
              pill +
            "</div>" +
          "</div>";
        }).join("");
      })
      .catch(function () {
        teamList.innerHTML = "<p>" + strings.error + "</p>";
      });
  }
});
