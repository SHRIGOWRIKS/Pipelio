// Pipelio Content Script
// Extracts job details from the current page

function extractJobDetails() {
  const url = window.location.href;
  const hostname = window.location.hostname;

  let details = {
    role: "",
    company: "",
    location: "",
    salary: "",
    jobUrl: url,
    source: hostname,
  };

  // ── LinkedIn ──────────────────────────────────────────────────────────────
  if (hostname.includes("linkedin.com")) {
    details.role =
      document.querySelector("h1.job-details-jobs-unified-top-card__job-title, h1.t-24")
        ?.textContent?.trim() || "";
    details.company =
      document.querySelector(
        ".job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name a"
      )?.textContent?.trim() || "";
    details.location =
      document.querySelector(
        ".job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet"
      )?.textContent?.trim() || "";
    details.salary =
      document.querySelector(
        ".job-details-jobs-unified-top-card__job-insight span, .jobs-unified-top-card__job-insight span"
      )?.textContent?.trim() || "";
  }

  // ── Indeed ────────────────────────────────────────────────────────────────
  else if (hostname.includes("indeed.com")) {
    details.role =
      document.querySelector("h1.jobsearch-JobInfoHeader-title, h1[data-testid='jobsearch-JobInfoHeader-title']")
        ?.textContent?.trim() || "";
    details.company =
      document.querySelector("[data-testid='inlineHeader-companyName'] a, .icl-u-lg-mr--sm")
        ?.textContent?.trim() || "";
    details.location =
      document.querySelector("[data-testid='job-location'], .icl-u-xs-mt--xs")
        ?.textContent?.trim() || "";
    details.salary =
      document.querySelector("[data-testid='attribute_snippet_testid'], #salaryInfoAndJobType")
        ?.textContent?.trim() || "";
  }

  // ── Glassdoor ─────────────────────────────────────────────────────────────
  else if (hostname.includes("glassdoor.com")) {
    details.role =
      document.querySelector("[data-test='job-title'], h1.heading_Heading__BqX5J")
        ?.textContent?.trim() || "";
    details.company =
      document.querySelector("[data-test='employer-name'], .EmployerProfile_employerName__Xemli")
        ?.textContent?.trim() || "";
    details.location =
      document.querySelector("[data-test='location'], .JobDetails_locationWrapper__Rw9t4")
        ?.textContent?.trim() || "";
    details.salary =
      document.querySelector("[data-test='salary-estimate'], .SalaryEstimate_salaryRange__brHFy")
        ?.textContent?.trim() || "";
  }

  // ── Lever ─────────────────────────────────────────────────────────────────
  else if (hostname.includes("lever.co")) {
    details.role =
      document.querySelector("h2[data-qa='posting-name'], .posting-headline h2")
        ?.textContent?.trim() || "";
    details.company =
      document.querySelector(".main-header-logo img")?.getAttribute("alt") ||
      document.title.split(" - ")[1]?.trim() || "";
    details.location =
      document.querySelector(".sort-by-time.posting-category, [data-qa='posting-categories'] .sort-by-location")
        ?.textContent?.trim() || "";
  }

  // ── Greenhouse ────────────────────────────────────────────────────────────
  else if (hostname.includes("greenhouse.io")) {
    details.role =
      document.querySelector("h1.app-title, h1[class*='title']")
        ?.textContent?.trim() || "";
    details.company =
      document.querySelector(".company-name, header .logo img")?.getAttribute("alt") ||
      document.title.split(" - ")[1]?.trim() || "";
    details.location =
      document.querySelector(".location, [class*='location']")
        ?.textContent?.trim() || "";
  }

  // ── Workday ───────────────────────────────────────────────────────────────
  else if (hostname.includes("workday.com") || hostname.includes("myworkdayjobs.com")) {
    details.role =
      document.querySelector("[data-automation-id='jobPostingHeader'], h2.css-1q2dra3")
        ?.textContent?.trim() || "";
    details.company =
      document.querySelector("[data-automation-id='jobPostingCompanyName']")
        ?.textContent?.trim() ||
      document.title.split(" - ")[1]?.trim() || "";
    details.location =
      document.querySelector("[data-automation-id='locations']")
        ?.textContent?.trim() || "";
  }

  // ── Ashby ─────────────────────────────────────────────────────────────────
  else if (hostname.includes("ashbyhq.com")) {
    details.role =
      document.querySelector("h1.ashby-job-posting-heading, h1")
        ?.textContent?.trim() || "";
    details.company =
      document.querySelector(".ashby-job-posting-company-name")
        ?.textContent?.trim() ||
      document.title.split(" at ")[1]?.trim() || "";
    details.location =
      document.querySelector(".ashby-job-posting-brief-items")
        ?.textContent?.trim() || "";
  }

  // ── Generic fallback ──────────────────────────────────────────────────────
  else {
    details.role = document.querySelector("h1")?.textContent?.trim() || "";
    details.company = document.title.split(" - ")[1]?.trim() || "";
  }

  // Clean up whitespace
  Object.keys(details).forEach((key) => {
    if (typeof details[key] === "string") {
      details[key] = details[key].replace(/\s+/g, " ").trim();
    }
  });

  return details;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "extractJob") {
    sendResponse(extractJobDetails());
  }
  return true;
});
