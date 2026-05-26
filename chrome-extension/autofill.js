// Pipelio Autofill Engine
// Fills job application forms with user profile data

(function () {
  "use strict";

  // ── Field matcher ────────────────────────────────────────────────────────────
  // Maps field patterns to profile keys
  const FIELD_MAP = [
    // Name
    { keys: ["first.?name", "fname", "given.?name"],          field: "firstName" },
    { keys: ["last.?name",  "lname", "family.?name", "surname"], field: "lastName" },
    { keys: ["full.?name",  "your.?name", "^name$"],           field: "fullName" },

    // Contact
    { keys: ["email", "e.?mail"],                              field: "email" },
    { keys: ["phone", "mobile", "cell", "telephone"],          field: "phone" },

    // Address
    { keys: ["address.?1", "address.?line.?1", "street"],      field: "addressLine1" },
    { keys: ["address.?2", "address.?line.?2", "apt", "suite"], field: "addressLine2" },
    { keys: ["city", "town"],                                  field: "city" },
    { keys: ["state", "province", "region"],                   field: "state" },
    { keys: ["zip", "postal", "postcode"],                     field: "zipCode" },
    { keys: ["country"],                                       field: "country" },

    // Professional
    { keys: ["title", "current.?title", "job.?title", "position", "role"], field: "currentRole" },
    { keys: ["linkedin", "linked.?in"],                        field: "linkedinUrl" },
    { keys: ["github", "git.?hub"],                            field: "githubUrl" },
    { keys: ["portfolio", "website", "personal.?site"],        field: "portfolioUrl" },
    { keys: ["pronouns"],                                      field: "pronouns" },
    { keys: ["years.?of.?exp", "experience.?years", "years.?exp"], field: "yearsExp" },
    { keys: ["skills", "technologies", "tech.?stack"],         field: "skills" },
  ];

  // ── Detect if this is an application form ────────────────────────────────────
  function isApplicationForm() {
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();

    const urlSignals = [
      "apply", "application", "jobs/apply", "careers/apply",
      "greenhouse.io", "lever.co", "workday.com", "myworkdayjobs",
      "ashbyhq.com", "jobvite.com", "icims.com", "taleo.net",
      "smartrecruiters.com", "bamboohr.com", "recruitee.com",
    ];

    const titleSignals = ["apply", "application", "job application"];

    const hasForm = document.querySelectorAll("form").length > 0;
    const hasInputs = document.querySelectorAll("input[type=text], input[type=email]").length >= 2;

    return (
      hasForm &&
      hasInputs &&
      (urlSignals.some(s => url.includes(s)) || titleSignals.some(s => title.includes(s)))
    );
  }

  // ── Match a field element to a profile key ───────────────────────────────────
  function matchField(el) {
    const attrs = [
      el.name, el.id, el.placeholder,
      el.getAttribute("aria-label"),
      el.getAttribute("data-field"),
      el.getAttribute("autocomplete"),
      el.closest("label")?.textContent,
      el.closest("[class]")?.className,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    for (const { keys, field } of FIELD_MAP) {
      for (const pattern of keys) {
        if (new RegExp(pattern, "i").test(attrs)) {
          return field;
        }
      }
    }
    return null;
  }

  // ── Fill a single input ──────────────────────────────────────────────────────
  function fillInput(el, value) {
    if (!value || el.disabled || el.readOnly) return false;

    // React/Vue synthetic event trick
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, "value"
    )?.set;
    const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, "value"
    )?.set;

    const setter = el.tagName === "TEXTAREA" ? nativeTextareaSetter : nativeInputValueSetter;

    if (setter) {
      setter.call(el, value);
    } else {
      el.value = value;
    }

    // Trigger all relevant events so React/Angular/Vue pick up the change
    ["input", "change", "blur", "keyup"].forEach(eventType => {
      el.dispatchEvent(new Event(eventType, { bubbles: true }));
    });

    // Visual feedback
    el.style.transition = "background-color 0.3s ease";
    el.style.backgroundColor = "#EEF4F0";
    setTimeout(() => { el.style.backgroundColor = ""; }, 1500);

    return true;
  }

  // ── Fill select dropdowns ────────────────────────────────────────────────────
  function fillSelect(el, value) {
    if (!value || el.disabled) return false;
    const lower = value.toLowerCase();

    // Try exact match first, then partial
    for (const opt of el.options) {
      if (opt.value.toLowerCase() === lower || opt.text.toLowerCase() === lower) {
        el.value = opt.value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    }
    // Partial match
    for (const opt of el.options) {
      if (opt.value.toLowerCase().includes(lower) || opt.text.toLowerCase().includes(lower)) {
        el.value = opt.value;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
    }
    return false;
  }

  // ── Main fill function ───────────────────────────────────────────────────────
  function fillForm(profile) {
    let filled = 0;
    const inputs = document.querySelectorAll(
      "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select"
    );

    inputs.forEach(el => {
      const fieldKey = matchField(el);
      if (!fieldKey || !profile[fieldKey]) return;

      const value = profile[fieldKey];
      let success = false;

      if (el.tagName === "SELECT") {
        success = fillSelect(el, value);
      } else {
        success = fillInput(el, value);
      }

      if (success) filled++;
    });

    return filled;
  }

  // ── Show autofill button overlay ─────────────────────────────────────────────
  function showAutofillButton(profile, onFill) {
    // Remove existing button if any
    const existing = document.getElementById("pipelio-autofill-btn");
    if (existing) existing.remove();

    const btn = document.createElement("div");
    btn.id = "pipelio-autofill-btn";
    btn.innerHTML = `
      <div style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #6B9E78;
        color: white;
        padding: 10px 16px;
        border-radius: 999px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(107,158,120,0.4);
        transition: all 0.2s ease;
        user-select: none;
      " id="pipelio-btn-inner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
        Autofill with Pipelio
        <span style="
          background: rgba(255,255,255,0.25);
          border-radius: 999px;
          padding: 1px 7px;
          font-size: 11px;
        " id="pipelio-field-count"></span>
      </div>
    `;

    // Count fillable fields
    const inputs = document.querySelectorAll(
      "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select"
    );
    let fillable = 0;
    inputs.forEach(el => {
      const key = matchField(el);
      if (key && profile[key]) fillable++;
    });

    if (fillable === 0) return; // Nothing to fill

    btn.querySelector("#pipelio-field-count").textContent = `${fillable} fields`;

    const inner = btn.querySelector("#pipelio-btn-inner");
    inner.addEventListener("mouseenter", () => {
      inner.style.background = "#5A8A67";
      inner.style.transform = "translateY(-1px)";
      inner.style.boxShadow = "0 6px 20px rgba(107,158,120,0.5)";
    });
    inner.addEventListener("mouseleave", () => {
      inner.style.background = "#6B9E78";
      inner.style.transform = "";
      inner.style.boxShadow = "0 4px 16px rgba(107,158,120,0.4)";
    });

    inner.addEventListener("click", () => {
      const count = onFill(profile);
      inner.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Filled ${count} fields!
      `;
      inner.style.background = "#4A7C59";
      setTimeout(() => btn.remove(), 2500);
    });

    document.body.appendChild(btn);
  }

  // ── Listen for messages from popup/background ────────────────────────────────
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === "checkIsForm") {
      sendResponse({ isForm: isApplicationForm() });
    }

    if (request.action === "autofill") {
      const count = fillForm(request.profile);
      sendResponse({ filled: count });
    }

    if (request.action === "showAutofillButton") {
      showAutofillButton(request.profile, fillForm);
      sendResponse({ shown: true });
    }

    return true;
  });

  // ── Auto-show button if on application form ──────────────────────────────────
  // Wait for page to settle, then check
  if (isApplicationForm()) {
    chrome.storage.local.get(["apiUrl", "token"], async ({ apiUrl, token }) => {
      if (!apiUrl || !token) return;
      try {
        const res = await fetch(`${apiUrl}/api/autofill`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profile = await res.json();
          showAutofillButton(profile, fillForm);
        }
      } catch { /* silent fail */ }
    });
  }
})();
