// Pipelio — Instant Save + Autofill Extension

const $ = (id) => document.getElementById(id);

let settings = { apiUrl: "", token: "" };
let profileCache = null;

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const stored = await chrome.storage.local.get(["apiUrl", "token"]);

  if (stored.apiUrl && stored.token) {
    settings = { apiUrl: stored.apiUrl.replace(/\/$/, ""), token: stored.token };
    showFooterStatus();
    // Check if on application form or job listing
    detectPageAndAct();
  } else {
    showState("setup");
  }

  // Wire up buttons
  $("btn-open-dashboard").onclick = openDashboard;
  $("btn-open-already").onclick   = openDashboard;
  $("btn-open-error").onclick     = openDashboard;
  $("btn-retry").onclick          = detectPageAndAct;
  $("settings-btn").onclick       = () => showState("setup");
  $("footer-dashboard").onclick   = (e) => { e.preventDefault(); openDashboard(); };
  $("btn-connect").onclick        = connect;
  $("btn-autofill").onclick       = doAutofill;
  $("btn-save-job").onclick       = autoSave;
  $("settings-link").onclick      = (e) => {
    e.preventDefault();
    if (settings.apiUrl) chrome.tabs.create({ url: settings.apiUrl + "/settings" });
  };
});

// ── Detect page type and act ──────────────────────────────────────────────────
async function detectPageAndAct() {
  showState("saving"); // show loading while detecting

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) { showState("notjob"); return; }

    // Inject scripts
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["autofill.js"] });
    } catch { /* already injected */ }

    // Check if it's an application form
    const formCheck = await new Promise(resolve => {
      chrome.tabs.sendMessage(tab.id, { action: "checkIsForm" }, res => {
        resolve(chrome.runtime.lastError ? { isForm: false } : res);
      });
    });

    if (formCheck?.isForm) {
      // It's an application form — show autofill UI
      await showAutofillUI(tab.id);
    } else {
      // It's a job listing — auto-save it
      await autoSave(tab);
    }
  } catch (err) {
    showError("Something went wrong. Try again.");
  }
}

// ── Autofill UI ───────────────────────────────────────────────────────────────
async function showAutofillUI(tabId) {
  try {
    // Fetch profile
    const res = await fetch(`${settings.apiUrl}/api/autofill`, {
      headers: { Authorization: `Bearer ${settings.token}` },
    });
    if (!res.ok) { showError("Could not load your profile."); return; }
    profileCache = await res.json();

    // Show autofill state
    const nameEl = $("autofill-name");
    const emailEl = $("autofill-email");
    if (nameEl) nameEl.textContent = profileCache.fullName || "—";
    if (emailEl) emailEl.textContent = profileCache.email || "—";

    // Count fillable fields
    const countRes = await new Promise(resolve => {
      chrome.tabs.sendMessage(tabId, { action: "checkIsForm" }, res => resolve(res));
    });

    showState("autofill");
  } catch {
    showError("Could not load profile for autofill.");
  }
}

// ── Do autofill ───────────────────────────────────────────────────────────────
async function doAutofill() {
  if (!profileCache) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  $("btn-autofill").textContent = "Filling...";
  $("btn-autofill").disabled = true;

  const result = await new Promise(resolve => {
    chrome.tabs.sendMessage(tab.id, { action: "autofill", profile: profileCache }, res => {
      resolve(chrome.runtime.lastError ? { filled: 0 } : res);
    });
  });

  showAutofillSuccess(result?.filled || 0);
}

function showAutofillSuccess(count) {
  const el = $("autofill-result");
  if (el) {
    el.textContent = `✓ Filled ${count} field${count !== 1 ? "s" : ""}`;
    el.style.display = "block";
  }
  $("btn-autofill").textContent = `✓ Filled ${count} fields`;
  $("btn-autofill").style.background = "#4A7C59";
}

// ── Auto-save job ─────────────────────────────────────────────────────────────
async function autoSave(existingTab) {
  showState("saving");

  try {
    const [tab] = existingTab
      ? [existingTab]
      : await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) { showState("notjob"); return; }

    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    } catch { /* already injected */ }

    const job = await new Promise(resolve => {
      chrome.tabs.sendMessage(tab.id, { action: "extractJob" }, res => {
        resolve(chrome.runtime.lastError ? null : res);
      });
    });

    if (!job || (!job.role && !job.company)) {
      showState("notjob"); return;
    }

    // Check duplicate
    if (job.jobUrl) {
      const checkRes = await fetch(
        `${settings.apiUrl}/api/jobs?search=${encodeURIComponent(job.company || "")}`,
        { headers: { Authorization: `Bearer ${settings.token}` } }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        const dup = existing.some(j =>
          j.jobUrl === job.jobUrl || (j.company === job.company && j.role === job.role)
        );
        if (dup) { showAlready(`${job.role} at ${job.company}`); return; }
      }
    }

    // Save
    const res = await fetch(`${settings.apiUrl}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.token}`,
      },
      body: JSON.stringify({
        role:        job.role     || "Unknown Role",
        company:     job.company  || "Unknown Company",
        location:    job.location || null,
        salary:      job.salary   || null,
        jobUrl:      job.jobUrl   || null,
        status:      "APPLIED",
        appliedDate: new Date().toISOString(),
      }),
    });

    if (res.status === 401) { showError("Session expired. Reconnect in Settings."); return; }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showError(err.error || `Error ${res.status}`);
      return;
    }

    showSuccess(`${job.role || "Job"} at ${job.company || "Company"}`);
  } catch {
    showError("Network error. Check your connection.");
  }
}

// ── Setup / connect ───────────────────────────────────────────────────────────
async function connect() {
  const apiUrl = $("url-input").value.trim().replace(/\/$/, "");
  const token  = $("token-input").value.trim();
  $("setup-error").style.display = "none";

  if (!apiUrl) { showSetupError("Enter your Pipelio URL."); return; }
  if (!token)  { showSetupError("Enter your API token."); return; }
  try { new URL(apiUrl); } catch { showSetupError("Invalid URL."); return; }

  $("btn-connect").textContent = "Connecting...";
  $("btn-connect").disabled = true;

  try {
    const res = await fetch(`${apiUrl}/api/jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) { showSetupError("Invalid token."); return; }
    await chrome.storage.local.set({ apiUrl, token });
    settings = { apiUrl, token };
    showFooterStatus();
    detectPageAndAct();
  } catch {
    showSetupError("Could not connect. Check your URL.");
  } finally {
    $("btn-connect").textContent = "Connect";
    $("btn-connect").disabled = false;
  }
}

function showSetupError(msg) {
  const el = $("setup-error");
  el.textContent = msg;
  el.style.display = "block";
}

// ── State helpers ─────────────────────────────────────────────────────────────
const STATES = ["saving", "success", "already", "error", "notjob", "setup", "autofill"];

function showState(name) {
  STATES.forEach(s => {
    const el = $(`state-${s}`);
    if (el) el.style.display = s === name ? "block" : "none";
  });
}

function showSuccess(jobName) {
  $("success-job-name").textContent = jobName;
  showState("success");
}
function showAlready(jobName) {
  $("already-job-name").textContent = jobName;
  showState("already");
}
function showError(msg) {
  $("error-msg").textContent = msg;
  showState("error");
}
function showFooterStatus() {
  $("footer-status").style.display = "flex";
}
function openDashboard() {
  if (settings.apiUrl) chrome.tabs.create({ url: settings.apiUrl + "/dashboard" });
}

// ── Auto-save flow ────────────────────────────────────────────────────────────
async function autoSave() {
  showState("saving");

  try {
    // 1. Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) { showState("notjob"); return; }

    // 2. Inject content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });
    } catch { /* already injected */ }

    // 3. Extract job details from page
    const job = await new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action: "extractJob" }, (res) => {
        resolve(chrome.runtime.lastError ? null : res);
      });
    });

    if (!job || (!job.role && !job.company)) {
      showState("notjob");
      return;
    }

    // 4. Check if already saved (search by URL)
    if (job.jobUrl) {
      const checkRes = await fetch(
        `${settings.apiUrl}/api/jobs?search=${encodeURIComponent(job.company || "")}`,
        { headers: { Authorization: `Bearer ${settings.token}` } }
      );
      if (checkRes.ok) {
        const existing = await checkRes.json();
        const alreadySaved = existing.some(
          (j) => j.jobUrl === job.jobUrl || (j.company === job.company && j.role === job.role)
        );
        if (alreadySaved) {
          showAlready(`${job.role} at ${job.company}`);
          return;
        }
      }
    }

    // 5. Save the job instantly
    const res = await fetch(`${settings.apiUrl}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.token}`,
      },
      body: JSON.stringify({
        role:        job.role     || "Unknown Role",
        company:     job.company  || "Unknown Company",
        location:    job.location || null,
        salary:      job.salary   || null,
        jobUrl:      job.jobUrl   || null,
        status:      "APPLIED",
        appliedDate: new Date().toISOString(),
      }),
    });

    if (res.status === 401) {
      showError("Session expired. Go to Settings and reconnect.");
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showError(err.error || `Error ${res.status}`);
      return;
    }

    // 6. Show success
    showSuccess(`${job.role || "Job"} at ${job.company || "Company"}`);

  } catch (err) {
    showError("Network error. Check your connection.");
  }
}

// ── Setup / connect ───────────────────────────────────────────────────────────
async function connect() {
  const apiUrl = $("url-input").value.trim().replace(/\/$/, "");
  const token  = $("token-input").value.trim();
  const errEl  = $("setup-error");

  errEl.style.display = "none";

  if (!apiUrl) { showSetupError("Enter your Pipelio URL."); return; }
  if (!token)  { showSetupError("Enter your API token."); return; }

  try { new URL(apiUrl); } catch {
    showSetupError("Invalid URL. Example: https://yourapp.vercel.app");
    return;
  }

  $("btn-connect").textContent = "Connecting...";
  $("btn-connect").disabled = true;

  try {
    const res = await fetch(`${apiUrl}/api/jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      showSetupError("Invalid token. Check your Pipelio Settings page.");
      return;
    }
    // Connected
    await chrome.storage.local.set({ apiUrl, token });
    settings = { apiUrl, token };
    showFooterStatus();
    autoSave(); // immediately try to save
  } catch {
    showSetupError("Could not connect. Check your URL.");
  } finally {
    $("btn-connect").textContent = "Connect";
    $("btn-connect").disabled = false;
  }
}

function showSetupError(msg) {
  const el = $("setup-error");
  el.textContent = msg;
  el.style.display = "block";
}

// ── State helpers ─────────────────────────────────────────────────────────────
const STATES = ["saving", "success", "already", "error", "notjob", "setup"];

function showState(name) {
  STATES.forEach(s => {
    $(`state-${s}`).style.display = s === name ? "block" : "none";
  });
}

function showSuccess(jobName) {
  $("success-job-name").textContent = jobName;
  showState("success");
}

function showAlready(jobName) {
  $("already-job-name").textContent = jobName;
  showState("already");
}

function showError(msg) {
  $("error-msg").textContent = msg;
  showState("error");
}

function showFooterStatus() {
  $("footer-status").style.display = "flex";
}

function openDashboard() {
  if (settings.apiUrl) {
    chrome.tabs.create({ url: settings.apiUrl + "/dashboard" });
  }
}
