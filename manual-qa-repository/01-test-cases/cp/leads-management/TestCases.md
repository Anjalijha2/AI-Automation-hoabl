# Test Cases — CP Portal / Leads Management

**Module:** CP Portal — Leads Management
**Route:** `https://uat-web.xrportal.in/leads`
**Generated:** 2026-06-04
**Generation Mode:** Dual-source (visual-memory + BRD/FRD)
**Visual Memory:** `visual-memory/cp/leads-management/INDEX.md` (CAPTURE_STATUS: FULL — 8 screenshots)
**BRD/FRD Source:** `.claude/docs/hoabl-knowledge-base/CP-Portal/FRD/CP-FS-Leads-Management.md`
**Supersedes:** Previous batch (Conditional / 50% coverage / incorrect action icon names — "share" and "copy"). All action-icon TCs have been rewritten using DOM-verified names: **"Resend Notification"** and **"Copy Link"**.

**Status:** APPROVED

---

## Test Cases

| TC_ID | Title | Priority | Precondition | Steps | Expected Result | Visual Evidence | BRD Req ID | Status |
|-------|-------|----------|--------------|-------|-----------------|-----------------|------------|--------|
| TC_LEADS_UI_001 | Page loads with "Leads" heading and table | High | CP logged in; session valid | 1. Navigate to `https://uat-web.xrportal.in/leads`<br>2. Wait for table render | Page heading `h3` shows text "Leads". Leads table renders with columns: S.No, Applicant Name, Applicant Phone, Status, Date of Sent, CP Name, CP HV Code, CP Mobile, Action. Sidebar shows "Leads" as active item. | `leads-loaded.png`, `screenshot-desktop.png` | CP-FS-Leads §1.1, §1.4 | Approved |
| TC_LEADS_UI_002 | Leads table column structure matches spec | High | TC_LEADS_UI_001 passed | 1. Inspect table header row of `.ant-table` on `/leads` | Headers in order: S.No \| Applicant Name \| Applicant Phone \| Status \| Date of Sent \| CP Name \| CP HV Code \| CP Mobile \| Action. Action column is sticky-right. | `leads-loaded.png` | CP-FS-Leads §1.4 | Approved |
| TC_LEADS_FUNC_003 | Status filter dropdown opens and lists all options | High | On `/leads` page | 1. Click `.ant-select :has-text("Status")`<br>2. Observe options panel | Dropdown overlay opens. Three status options are visible matching the lead-lifecycle: Sent, Registered, Refunded. | `leads-status-dropdown-open.png` | CP-FS-Leads §1.5, lifecycle section | Approved |
| TC_LEADS_FUNC_004 | Team Leads dropdown opens and lists team-lead options | High | On `/leads` page | 1. Click `.ant-select :has-text("All Team Leads")`<br>2. Observe options panel | Dropdown opens. Three team-lead options visible (per current CP scope). Default selected label is "All Team Leads". | `leads-team-leads-dropdown-open.png` | CP-FS-Leads §1.5 (CP-scoped filtering) | Approved |
| TC_LEADS_FUNC_005 | Search by name returns matching lead | High | At least one lead with name containing "Sanket" exists for current CP | 1. Type `Sanket` into `input[placeholder="Search Customer"]`<br>2. Wait for table to refresh | Table filters to rows whose Applicant Name contains "Sanket". Non-matching rows are hidden. Result count reduces accordingly. | `leads-search-result.png` | CP-FS-Leads §1.4 (Lead Name searchable) | Approved |
| TC_LEADS_NEG_006 | Search with no-match query shows empty state | Medium | On `/leads` page | 1. Type `ZZNOTFOUND` into `input[placeholder="Search Customer"]`<br>2. Wait for table to refresh | Table displays no data rows. Ant-design empty/no-data placeholder is shown. No JS errors in console. | `leads-search-no-match.png` | CP-FS-Leads §1.4 | Approved |
| TC_LEADS_FUNC_007 | "Resend Notification" action triggers backend silently | High | A lead row exists with valid phone/email | 1. Locate first lead row's Action cell<br>2. Click `button.reset-btn` whose SVG `<title>` = "Resend Notification" (paper-airplane icon)<br>3. Observe UI for 700ms | Backend resend API is fired (per BRD §1.6 — CP can re-engage leads). UI shows NO toast, NO modal, NO new tab — current build provides no visible feedback. (Flagged: UX gap — see Bug Notes below.) | `leads-share-action.png` | CP-FS-Leads §1.6 (System Actions — re-engagement) | Approved |
| TC_LEADS_FUNC_008 | "Copy Link" action copies referral URL to clipboard silently | High | Browser context has clipboard-write permission; one lead row visible | 1. Locate first lead row's Action cell<br>2. Click `button.reset-btn` whose SVG `<title>` = "Copy Link" (document/copy icon)<br>3. Read system clipboard contents | Clipboard contains a referral URL of form `https://uat.xrportal.in/ref/<sha256-like-token>` (e.g. `https://uat.xrportal.in/ref/02e2e02ca41382306396dbb87cde0bfd5e5c6d6e8b5dc6c89f93f8c4456e0929`). NO toast, NO modal observed within 250ms. (Flagged: UX gap.) | `leads-copy-action.png` | CP-FS-Leads §1.6 (CP shares lead invitation) | Approved |
| TC_LEADS_VAL_009 | Action icons are correctly labelled (DOM `<title>`) | High | On `/leads` with at least one lead row | 1. Inspect Action cell of first row<br>2. Read `<title>` of each SVG inside `button.reset-btn` | Exactly two action buttons per row. First icon SVG `<title>` = "Resend Notification". Second icon SVG `<title>` = "Copy Link". (NOT "share" / "copy" — supersedes previous batch.) | `leads-share-action.png`, `leads-copy-action.png` | CP-FS-Leads §1.6 | Approved |
| TC_LEADS_UI_010 | Status badge "Registered" renders as green pill | Medium | At least one lead with status Registered (e.g., Testinglead CPmember) | 1. Locate row where Status column = "Registered"<br>2. Inspect badge styling | Badge is rendered as a pill with green background, text "Registered". Per BRD: indicates customer has paid token amount and registration is complete. | `leads-loaded.png`, `screenshot-desktop.png` | CP-FS-Leads (Lead Status Flow — Registered) | Approved |
| TC_LEADS_UI_011 | Status badge "Refunded" renders as red/pink pill | Medium | At least one lead with status Refunded | 1. Locate row where Status column = "Refunded"<br>2. Inspect badge styling | Badge is rendered as a pill with red/pink background, text "Refunded". Per BRD: indicates registration was cancelled/refunded. | `screenshot-desktop.png` | CP-FS-Leads (Lead Status Flow — Refunded) | Approved |
| TC_LEADS_UI_012 | Status badge "Sent" renders as orange/yellow pill | Medium | At least one lead with status Sent | 1. Locate row where Status column = "Sent"<br>2. Inspect badge styling | Badge is rendered as a pill with orange/yellow background, text "Sent". Per BRD: link has been shared, customer not yet registered. | `screenshot-desktop.png` | CP-FS-Leads (Lead Status Flow — Sent) | Approved |
| TC_LEADS_BIZ_013 | Lead status lifecycle: Sent → Registered → Refunded | High | Tester has DB / API visibility of seed leads | 1. Verify a lead exists in each terminal state<br>2. Confirm a "Sent" lead transitions to "Registered" after token-amount payment<br>3. Confirm a "Registered" lead can move to "Refunded" on cancellation | Status transitions match documented flow:<br>– Sent: invite shared, not yet registered<br>– Registered: token paid, registration complete<br>– Refunded: registration cancelled. No undocumented intermediate states surface in the UI. | `screenshot-desktop.png`, `leads-loaded.png` | CP-FS-Leads (Lead Status Flow), §1.5, §1.6 | Approved |
| TC_LEADS_BIZ_014 | CP isolation — CP sees only their own leads | Critical | Two CPs (CP-A, CP-B) with distinct leads exist | 1. Log in as CP-A → open `/leads` → record visible lead identifiers<br>2. Log out, log in as CP-B → open `/leads` → record visible lead identifiers | CP-A's view shows only leads where CP-A is the assigned CP (CP Name / CP HV Code matches CP-A). CP-B sees only their own. No cross-tenant leakage. Aligned with BRD §1.2 ("CPs see only their own leads"). | `leads-loaded.png` | CP-FS-Leads §1.2, §1.5 (Rule 2) | Approved |
| TC_LEADS_UI_015 | Pagination control renders with default page size | Medium | Total leads > page size OR pagination control visible regardless | 1. Scroll to bottom of `/leads` table<br>2. Inspect pagination footer | Antd pagination control is rendered. Page-size selector defaults to `10 / page`. Page numbers visible if total > 10; otherwise control is present in a single-page state. | `leads-loaded.png` | CP-FS-Leads §1.4 (table behaviour) | Approved |
| TC_LEADS_FUNC_016 | Combined filter: Status + Search both apply | Medium | At least one Registered lead with name containing "Sanket" | 1. Select Status = "Registered" from `.ant-select :has-text("Status")`<br>2. Type `Sanket` into search input | Table shows only rows that satisfy BOTH filters (Status = Registered AND Applicant Name contains "Sanket"). Empty state if no row matches both. | `leads-status-dropdown-open.png`, `leads-search-result.png` | CP-FS-Leads §1.4 | Approved |
| TC_LEADS_NEG_017 | Unauthenticated access to `/leads` redirects to login | Critical | No valid CP session (cleared cookies / storage) | 1. Open `https://uat-web.xrportal.in/leads` in a clean context | User is redirected to CP login screen. Leads page does not render. | `leads-loaded.png` (negative baseline) | CP-FS-Leads §1.3 (Preconditions) | Approved |
| TC_LEADS_UI_018 | Sidebar navigation marks "Leads" as active on `/leads` | Low | CP logged in | 1. Navigate to `/leads`<br>2. Inspect sidebar item state | Sidebar list shows: Home, KYC, JBP, Leads (active), Logout. "Leads" item has active styling. | `leads-loaded.png` | CP-FS-Leads §1.1 (navigation entry) | Approved |
| TC_LEADS_FUNC_019 | Clear Status filter restores full lead list | Low | Status filter previously applied | 1. Apply Status = "Registered"<br>2. Clear the Status filter (X icon / "All") | Table re-renders showing all leads for the current CP across all statuses. Row count returns to original. | `leads-status-dropdown-open.png`, `leads-loaded.png` | CP-FS-Leads §1.4 | Approved |
| TC_LEADS_FUNC_020 | Clear Search input restores full lead list | Low | Search filter previously applied | 1. Type `Sanket` into search input<br>2. Clear the input | Table re-renders with full lead list for current CP. No residual filter applied. | `leads-search-result.png`, `leads-loaded.png` | CP-FS-Leads §1.4 | Approved |

---

## Bug / UX Notes flagged from this batch

| Ref | Observation | Severity (proposed) |
|-----|-------------|---------------------|
| UX-LEADS-001 | "Resend Notification" click produces no visible feedback (no toast, no modal). User cannot confirm whether resend succeeded. | Medium |
| UX-LEADS-002 | "Copy Link" click produces no visible feedback (no toast, no modal). Clipboard payload is correct, but user has no UI confirmation. Toastify container is present at app level but no toast is spawned. | Medium |

(Log these to `manual-qa-repository/04-bug-reports/BUG_TRACKER.md` via QA Agent if confirmed as defects rather than intended behaviour.)

---

## Review Summary

- **Total TCs:** 20
- **Priority mix:** Critical 2, High 8, Medium 7, Low 3
- **Type mix:** UI 7, FUNC 7, NEG 2, VAL 1, BIZ 2 (no API/DB — feature is read-only proxy over LSQ; LSQ excluded per project constraint)
- **Coverage of captured screenshots:** 8 / 8 referenced (100% visual coverage of provided evidence)
  - `screenshot-desktop.png` — TC_010, TC_011, TC_012, TC_013
  - `leads-loaded.png` — TC_001, TC_002, TC_010, TC_013, TC_014, TC_015, TC_018, TC_019, TC_020
  - `leads-status-dropdown-open.png` — TC_003, TC_016, TC_019
  - `leads-team-leads-dropdown-open.png` — TC_004
  - `leads-search-result.png` — TC_005, TC_016, TC_020
  - `leads-search-no-match.png` — TC_006
  - `leads-share-action.png` — TC_007, TC_009
  - `leads-copy-action.png` — TC_008, TC_009
- **Visual coverage %:** 100% (8/8 screenshots cited at least once); previous batch was 50% — gap closed.
- **Correction status:** Action-icon naming corrected across all action TCs (TC_007, TC_008, TC_009) — uses DOM-verified labels "Resend Notification" and "Copy Link". Previous incorrect labels ("share", "copy") fully removed.
- **BRD/FRD traceability:** 20/20 TCs map to a BRD/FRD requirement ID — no orphans.
- **Dual-source confirmation:** YES — both `visual-memory/cp/leads-management/INDEX.md` (FULL) and `CP-FS-Leads-Management.md` consumed.
- **Constraint compliance:** LSQ excluded (no LSQ API calls or credentials referenced); only downstream portal-UI effects tested.
- **Overall Status:** **APPROVED** (replaces previous Conditional batch).
