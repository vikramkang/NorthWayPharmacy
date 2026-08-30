// NorthWay Clinic and Pharmacy — shared front-end behaviour (Phase 1)
// No analytics, no third-party trackers. This file talks to exactly one
// backend endpoint (registration submissions) and nothing else.

document.addEventListener("DOMContentLoaded", function () {
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
});
