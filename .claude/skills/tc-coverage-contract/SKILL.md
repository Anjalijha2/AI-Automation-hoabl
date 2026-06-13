---
name: tc-coverage-contract
description: >
  Enforce complete, evidence-grounded test-case generation for any application module.
  Use this skill whenever generating, expanding, reviewing, or auditing test cases /
  test scenarios for a feature or module (UI flows, forms, dashboards, APIs). It guarantees
  coverage across all test dimensions (positive, negative, validation, boundary, role/auth,
  error-handling, notification, API/backend, integration, context-sensitive controls),
  forbids assuming any feature behaviour, and requires every case to trace to visual evidence
  and/or a BRD / FRD / FS / user-manual source. Trigger on requests like "write test cases",
  "generate TCs for <module>", "find missing test cases", "audit this test suite", or any
  goal-based QA execution run.
user-invocable: true
---

# Test-Case Coverage Contract

> Companion files (read when relevant):
> - `dimensions-reference.md` — the 11 coverage dimensions, expanded with XR Portal examples
> - `xrportal-format.md` — the EXACT 12-column XR Portal test-sheet format, notes block, and sub-module banner convention (the gold standard every generated sheet must match)
> - `coverage-matrix-template.md` — the self-audit matrix to fill before declaring a module complete

## 0. PRIME DIRECTIVE — NEVER ASSUME A FEATURE

Do **not** invent, guess, or infer any feature, field, label, value, limit, status,
error message, notification channel, or business rule. Every assertion must come from a
real source. Work strictly from, in this order of authority:

1. **Visual evidence** — screenshots, screen recordings, the live UI / UAT page, UX design
   links (Adobe XD, Figma). Use these for layout, fields, labels, buttons, tooltips, states.
2. **BRD / FRD / FS document** — for business logic, validations, system actions, statuses,
   integrations, and notification rules.
3. **User manual / how-to docs** — for intended user workflows and step sequences.

Rules:

- If a behaviour is **not** found in any of the above, do **NOT** write a pass/fail
  expectation. Create the case but prefix the scenario with **`[VERIFY WITH DEV]`** and
  write the Expected result as **`[To verify] …`**. Flag it for confirmation.
- Never fabricate a numeric limit (use the real value from the spec/pool), a status enum, a
  gateway/provider name, a country rule, or a notification channel.
- When a source carries a **"CORRECTED" / dated** note, the **latest correction wins**. If
  another document still states the old behaviour, flag it as **stale** in the output.
- If sources conflict, surface the conflict explicitly; do not silently pick one.
- Use the screenshot to *enumerate* every field/control on a form. If a field exists in the
  UI but has no test case, that is a coverage gap, not an optional extra.

## 1. COVERAGE DIMENSIONS (mandatory per feature)

For **every** feature, generate cases across all dimensions below. If a dimension genuinely
does not apply, write one line stating why — do not skip silently.

1. **Positive / happy path** — the primary success flow, end to end.
2. **Full-form coverage** — every field, dropdown, toggle, and button in each modal/form.
3. **Mandatory-field & validation** — each required field empty → blocked; each numeric
   field tested at 0, negative, decimal, and the real min/max boundary.
4. **Re-check / race conditions at submit** — wherever the spec says the server
   re-validates (e.g. "no longer available", "already booked").
5. **Negative / error handling** — server 500, network failure, empty / no-data state, and
   every documented error-message string.
6. **Context-sensitive controls** — when one control behaves differently by row state /
   status, write a case for each state **and** a routing case proving it picks the right one.
7. **Notifications** — explicitly assert "no SMS / WhatsApp / email is sent" wherever the
   source says an action is silent. Silence-by-design is a required assertion, not an omission.
8. **UI-vs-backend validation split** — if the backend is more permissive than the UI, add
   an API-layer case proving the bypass. Never assume the backend enforces what the form does.
9. **Role / auth / security** — unauthenticated access, invalid / expired token (401/403),
   logout-token-validity, and multi-tenant / project data isolation.
10. **Integration / cross-module** — every downstream sync named in the spec (ERP, CRM,
    websocket, config, inventory) gets a verification case.
11. **Boundary** — pagination edges, last partial page, file-upload type/size, max page size.

See `dimensions-reference.md` for worked XR Portal examples of each dimension.

## 2. NO-SILENT-DROP RULE

- Never mark a case **superseded / deprecated / duplicate** unless you name the exact
  replacement case ID(s) that cover the **same** behaviour. If no replacement exists, the
  case stays active.
- Splitting one flow into two (e.g. Cancel Unit vs Cancel Registration) requires a case for
  **each** branch **plus** a routing case — never delete the original.

## 3. OUTPUT DISCIPLINE

- One consistent ID scheme; one Sub-Module per case.
- Rows ordered in **execution sequence** so automation runs top-to-bottom with dependencies
  first.
- Destructive cases (cancel / swap / assign / parking / payment) must carry concrete
  disposable test data or a **`[TEST_DATA_REQUIRED]`** marker — never ship blank.
- Match the project's existing test-sheet template (columns, headers, banners) exactly;
  existing template conventions override defaults. **For XR Portal that template is defined
  in `xrportal-format.md` — follow it precisely.**

## 4. SELF-AUDIT GATE (run before declaring a module complete)

Produce a **coverage matrix** (template in `coverage-matrix-template.md`):

- Rows = every feature / sub-feature found in the screenshots + BRD/FRD/FS + user manual.
- Columns = the 11 dimensions in §1.
- Each cell = a generated case ID **or** a one-line justified `N/A`.

If any cell is **unjustified-empty**, the module is **NOT done** — generate the missing case.
The agent must never self-declare a module complete while the matrix has an unjustified gap.

## 5. EVIDENCE TAG ON EVERY CASE

Each generated case must carry its source so traceability is auditable later, e.g.:
`Source: <screenshot ref> + <BRD/FRD §x / FS §x / user-manual §x>`.

A case with no traceable source is **invalid** and must not be emitted.

---

## XR Portal application

- **Called by**: BA Agent (during `manual-tester` generation) and QA Agent (during
  `test-case-reviewer` audits and goal-based execution runs).
- **Visual evidence source**: `visual-memory/<portal>/<module>/INDEX.md`.
- **Doc source**: `.claude/docs/hoabl-knowledge-base/<Portal>-Portal/{BRD,FRD,FS}/`.
- **Output sheet format**: per `xrportal-format.md` (12 columns, notes block, sub-module
  banners). Gold-standard reference: Admin → Customers module.
- **Dual-source gate** still applies: visual-memory INDEX.md + BRD/FRD both required before
  generation (see CLAUDE.md "Dual-Source TC Rule").
