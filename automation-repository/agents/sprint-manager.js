const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(process.cwd(), "docs");
const PROJECT_MEMORY_DIR = path.join(DOCS_DIR, "project-memory");
const BRD_DIR = path.join(process.cwd(), "brd");

const COVERAGE_FILE = path.join(DOCS_DIR, "test-coverage.md");
const SPRINT_FILE = path.join(DOCS_DIR, "SPRINT_LOG.md");
const TASK_FILE = path.join(DOCS_DIR, "TASK_TRACKER.md");
const CHANGELOG_FILE = path.join(DOCS_DIR, "CHANGELOG.md");

const ACTION = process.argv[2] || "status";

const MODULE_COVERAGE = [
  { feature: "Login", manual: 22, automated: 22, specFile: "login.spec.js", status: "Done - Full Coverage" },
  { feature: "Customers", manual: 17, automated: 17, specFile: "customers.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Tower Configuration", manual: 6, automated: 6, specFile: "config.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Max Preferences", manual: 4, automated: 4, specFile: "config.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Customer Actions", manual: 3, automated: 3, specFile: "config.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Sample Downloads", manual: 6, automated: 6, specFile: "config.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Registration Status", manual: 7, automated: 7, specFile: "config.spec.js", status: "Done - Automated (2 ENV skips on UAT)" },
  { feature: "Config - Unit Status", manual: 6, automated: 6, specFile: "config.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Unit Cost Update", manual: 4, automated: 4, specFile: "config.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Bulk Booking Cancellation", manual: 3, automated: 3, specFile: "config.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Bulk Reg Cancellation", manual: 3, automated: 3, specFile: "config.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Sales Managers", manual: 8, automated: 8, specFile: "config.spec.js", status: "Done - Full Coverage" },
  { feature: "Config - Customer Portal", manual: 5, automated: 5, specFile: "config.spec.js", status: "Done - Full Coverage (ENV skip on UAT)" },
  { feature: "Allocation", manual: 44, automated: 44, specFile: "allocation.spec.js", status: "Done - Automated (ENV skip guards on UAT/live gateway flows)" },
  { feature: "Towers", manual: 13, automated: 13, specFile: "towers.spec.js", status: "Done - Full Coverage" },
  { feature: "Channel Partners", manual: 0, automated: 0, specFile: "-", status: "Pending" },
  { feature: "JBP Management", manual: 0, automated: 0, specFile: "-", status: "Pending" }
];

function indiaNow() {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}

function generateCoverageReport() {
  const totalManual = MODULE_COVERAGE.reduce((sum, item) => sum + item.manual, 0);
  const totalAutomated = MODULE_COVERAGE.reduce((sum, item) => sum + item.automated, 0);
  const pending = MODULE_COVERAGE.filter((item) => item.manual === 0).length;

  let md = "# Test Coverage Report\n\n";
  md += `**Last updated:** ${indiaNow()}  \n`;
  md += "**Maintained by:** Agent 7 - Sprint & Knowledge Manager\n\n";
  md += "---\n\n";
  md += "| Feature | Manual TCs | Automated | Spec File | Status |\n";
  md += "|---------|------------|-----------|-----------|--------|\n";
  for (const item of MODULE_COVERAGE) {
    md += `| ${item.feature} | ${item.manual || "-"} | ${item.automated || "-"} | \`${item.specFile}\` | ${item.status} |\n`;
  }
  md += "\n---\n\n";
  md += `**Summary:** ${totalManual} manual test cases | ${totalAutomated} automated | Sprint 1 done | Sprint 2 done | Sprint 3 Allocation done | Sprint 3 Towers done | ${pending} modules pending\n\n`;
  md += "---\n\n";
  md += "## Known Open Bugs\n\n";
  md += "| Bug ID | Module | Severity | Status | Description |\n";
  md += "|--------|--------|----------|--------|-------------|\n";
  md += "| BUG_010 | Config - Registration Status | Medium | Open | No validation shown when Submit is clicked without selecting a file |\n";
  return md;
}

function generateSprintLog() {
  return `# Sprint Log

**Last updated:** ${indiaNow()}

---

## Sprint 1 - Framework Setup & Core Module Coverage

**Goal:** Establish the QA framework and automate Login + Customers.

**Status:** Complete

### Completed
- [x] Playwright + JavaScript project setup
- [x] Auth session caching
- [x] Login automation complete - 22 tests
- [x] Customers automation complete - 17 tests
- [x] Base docs, manual test cases, and agent scripts created

---

## Sprint 2 - Config Module Test Coverage

**Goal:** Automate Config CMS workflows.

**Status:** Complete

### Completed
- [x] Config automation complete - 53 tests
- [x] Config docs and manual test cases updated
- [x] BUG_010 logged

---

## Sprint 3 - Remaining Modules

**Goal:** Expand coverage to Allocation, Towers, Channel Partners, and JBP Management.

**Status:** In Progress - Allocation complete, Towers complete

### Completed
- [x] Allocation module - 44 tests (3 Setup + 11 Admin + 30 Customer)
- [x] Towers module - 13 tests, all PASS
- [x] Sprint documentation synced to final accepted counts

### Pending
- [ ] Channel Partners module
- [ ] JBP Management module
- [ ] Full regression suite + CI pipeline setup
`;
}

function generateTaskTracker() {
  return `# Task Tracker

**Maintained by:** Scrum Master  
**Last updated:** ${indiaNow()} - Generated by Agent 7

---

## Completed Tasks

| Task | Module | Agent | Status |
|------|--------|-------|--------|
| Project setup | All | Setup | Done |
| Auth session caching | Login | Agent 3 | Done |
| Login automation (22 tests) | Login | Agent 3 | Done |
| Customers automation (17 tests) | Customers | Agent 3 | Done |
| Config automation (53 tests) | Config | QA Agent | Done |
| Allocation full E2E automation (44 tests) | Allocation | QA Agent | Done |
| Towers automation (13 tests) | Towers | QA Agent | Done |
| All 8 agent scripts created | Framework | Agent 7 | Done |

---

## In Progress

*None - active implementation work is pending on the remaining modules and CI.*

---

## Pending Tasks

| Task | Module | Priority | Agent |
|------|--------|----------|-------|
| Automate Channel Partners | Channel Partners | P1 | QA Agent |
| Automate JBP Management | JBP Mgmt | P2 | QA Agent |
| Full regression suite + CI pipeline | All | P1 | Agent 4 |
| Fix BUG_010 - client-side Submit validation | Config | P3 | Dev Team |
`;
}

function appendChangelog(entry) {
  let content = fs.existsSync(CHANGELOG_FILE)
    ? fs.readFileSync(CHANGELOG_FILE, "utf-8")
    : "# Changelog\n\nAll notable changes to the XR Portal QA Framework are documented here.\n\n---\n\n";

  const today = new Date().toISOString().split("T")[0];
  if (content.includes(`## [${today}] - Documentation Sync`)) return;

  const separator = content.indexOf("\n---\n");
  if (separator !== -1) {
    content = content.slice(0, separator + 5) + "\n" + entry + "\n" + content.slice(separator + 5);
  } else {
    content += "\n" + entry;
  }

  fs.writeFileSync(CHANGELOG_FILE, content);
}

function buildChangelogEntry() {
  const date = new Date().toISOString().split("T")[0];
  return `## [${date}] - Documentation Sync

### Updated
- README refreshed to current repo state
- Allocation count normalized to 44
- Towers count normalized to 13
- sprint-manager output aligned with current coverage and pending work
`;
}

function parseBRD(content) {
  const lines = content.split("\n");
  const epics = [];
  let currentEpic = null;
  let currentFeature = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      currentEpic = { name: trimmed.replace(/^## /, ""), description: "", features: [] };
      epics.push(currentEpic);
      currentFeature = null;
    } else if (trimmed.startsWith("### ") && currentEpic) {
      currentFeature = { name: trimmed.replace(/^### /, ""), stories: [] };
      currentEpic.features.push(currentFeature);
    } else if ((trimmed.startsWith("- ") || trimmed.startsWith("* ")) && currentFeature) {
      currentFeature.stories.push({ text: trimmed.replace(/^[-*] /, "") });
    } else if (currentEpic && !currentFeature && !trimmed.startsWith("#")) {
      currentEpic.description += (currentEpic.description ? " " : "") + trimmed;
    }
  }

  return epics;
}

function generateSprintPlanDoc(epics, brdFileName) {
  const totalFeatures = epics.reduce((sum, epic) => sum + epic.features.length, 0);

  let md = "# Sprint Plan\n\n";
  md += `**Source BRD:** \`brd/${brdFileName}\`  \n`;
  md += `**Generated:** ${indiaNow()}  \n`;
  md += "**Status:** Draft - Pending Review\n\n";
  md += "---\n\n";

  if (epics.length === 0) {
    md += "_No epics found. Use ## for epics and ### for features._\n";
    return md;
  }

  md += "## Summary\n\n";
  md += "| Metric | Value |\n";
  md += "|--------|-------|\n";
  md += `| Total Epics | ${epics.length} |\n`;
  md += `| Total Features | ${totalFeatures} |\n`;
  md += `| Estimated Sprints | ${Math.ceil(totalFeatures / 2)} |\n\n`;

  epics.forEach((epic, epicIndex) => {
    md += `## Epic ${epicIndex + 1}: ${epic.name}\n\n`;
    if (epic.description) md += `> ${epic.description}\n\n`;

    epic.features.forEach((feature, featureIndex) => {
      md += `### Feature E${epicIndex + 1}.F${featureIndex + 1}: ${feature.name}\n\n`;
      if (feature.stories.length > 0) {
        md += "**User Stories / Acceptance Criteria:**\n\n";
        feature.stories.forEach((story) => {
          md += `- [ ] ${story.text}\n`;
        });
        md += "\n";
      }

      md += "| Agent | Task | Status |\n";
      md += "|-------|------|--------|\n";
      md += `| Agent 0 - Discovery | Crawl and map UI elements for "${feature.name}" | Pending |\n`;
      md += `| Agent 1 - Page Docs | Document selectors and workflows for "${feature.name}" | Pending |\n`;
      md += `| Agent 2 - Test Cases | Write manual test cases for "${feature.name}" | Pending |\n`;
      md += `| Agent 3 - Automation | Create Playwright automation for "${feature.name}" | Pending |\n`;
      md += `| Agent 4 - Execution | Execute and validate tests | Pending |\n`;
      md += `| Agent 5 - Defect | Log failures | Pending |\n`;
      md += `| Agent 6 - Healing | Analyze selector issues | Pending |\n`;
      md += `| Agent 7 - Sprint Manager | Update trackers and changelog | Pending |\n\n`;
    });
  });

  return md;
}

function planFromBRD() {
  if (!fs.existsSync(BRD_DIR)) {
    fs.mkdirSync(BRD_DIR, { recursive: true });
    console.log("Created brd/ folder. Add markdown BRDs and re-run.");
    return;
  }

  const brdFiles = fs.readdirSync(BRD_DIR).filter((file) => file.endsWith(".md") && !file.startsWith("TEMPLATE"));
  if (brdFiles.length === 0) {
    console.log("No BRD markdown files found in brd/.");
    return;
  }

  fs.mkdirSync(PROJECT_MEMORY_DIR, { recursive: true });

  for (const brdFile of brdFiles) {
    const content = fs.readFileSync(path.join(BRD_DIR, brdFile), "utf-8");
    const epics = parseBRD(content);
    const plan = generateSprintPlanDoc(epics, brdFile);
    const baseName = brdFile.replace(".md", "").toUpperCase().replace(/[^A-Z0-9]/g, "_");
    const outFile = path.join(PROJECT_MEMORY_DIR, `SPRINT_PLAN_${baseName}.md`);
    fs.writeFileSync(outFile, plan);
    console.log(`Generated: ${outFile}`);
  }
}

function showStatus() {
  console.log("\n" + generateCoverageReport());
}

function updateAll() {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  fs.mkdirSync(PROJECT_MEMORY_DIR, { recursive: true });

  fs.writeFileSync(COVERAGE_FILE, generateCoverageReport());
  fs.writeFileSync(SPRINT_FILE, generateSprintLog());
  fs.writeFileSync(TASK_FILE, generateTaskTracker());
  appendChangelog(buildChangelogEntry());

  console.log("Sprint manager update complete");
}

function run() {
  if (ACTION === "status") showStatus();
  else if (ACTION === "plan-brd") planFromBRD();
  else updateAll();
}

run();
