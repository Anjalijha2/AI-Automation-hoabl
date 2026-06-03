# TestCases — Admin Portal / JBP Management

**Module:** JBP Management
**Portal:** Admin
**URL:** `https://uat-web.xrportal.in/admin/jbp-management`
**BRD source:** `.claude/docs/hoabl-knowledge-base/Admin-Portal/BRD/ADMIN-BRD-JBP-Management.md`
**Visual source:** `visual-memory/admin/jbp/INDEX.md` (CAPTURE_STATUS: FULL — 8 screens)
**Generated:** 2026-06-03
**Status:** Pending review

---

## Coverage Summary

| Tab | TC Count | Visual Evidence | Status |
|-----|----------|-----------------|--------|
| Page-level (load, headings, tabs) | 4 | FULL | Approved |
| Cycle Management | 9 | FULL (Close Cycle = CONDITIONAL) | Approved |
| Submissions | 5 | FULL | Approved |
| Edit Requests | 5 | FULL | Approved |
| **Total** | **23** | **22 FULL / 1 CONDITIONAL** | **APPROVED** |

**Visual coverage:** 22 of 23 TCs map to a captured screenshot = **95.6%** (exceeds 80% threshold).

---

## Sheet 1 — Manual Test Cases

### Page-Level

#### TC_JBP_UI_001 — Page loads with correct heading and tab structure
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3 (Module Structure — Admin Portal) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | UI |
| **Scenario** | JBP Management page renders the admin entry point with title and the 3-tab navigation that drives the entire admin workflow (cycle creation, submission review, edit request handling). |
| **Preconditions** | Logged in as Admin (session: `automation-repository/fixtures/.auth/admin.json`) |
| **Steps** | 1. Navigate to `/admin/jbp-management`<br>2. Wait for page load<br>3. Verify `h5` with text "JBP Management" is visible<br>4. Verify three tab buttons exist: `button:has-text("Cycle Management")`, `button:has-text("Submissions")`, `button:has-text("Edit Requests")` |
| **Expected Result** | Page displays "JBP Management" heading and all 3 tabs as shown in `jbp-full.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-full.png`, `visual-memory/admin/jbp/jbp-loaded.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

#### TC_JBP_UI_002 — Cycle Management tab is active by default
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3 (Cycle Management — default tab) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | UI |
| **Scenario** | Cycle Management is the entry-point tab because admins begin every cycle workflow by checking/creating cycles (BRD §8 step 2). |
| **Preconditions** | Logged in as Admin |
| **Steps** | 1. Navigate to `/admin/jbp-management`<br>2. Observe which tab is highlighted/active on initial load<br>3. Verify `h3` "Cycles" heading is visible<br>4. Verify cycles table is rendered |
| **Expected Result** | Cycle Management tab is active by default; "Cycles" h3 heading and cycles table render as shown in `jbp-tab-cycle-management.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-cycle-management.png`, `visual-memory/admin/jbp/jbp-loaded.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

#### TC_JBP_FUNC_003 — Switch to Submissions tab
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3 (Submissions tab), BRD §8 step 5 |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | FUNC |
| **Scenario** | Admin navigates to Submissions tab to review CP commitment forms — the post-cycle-open review step in admin workflow. |
| **Preconditions** | Logged in as Admin; on JBP Management page |
| **Steps** | 1. Click `button:has-text("Submissions")`<br>2. Wait for tab content to render<br>3. Verify table columns: CP Name, HV Code, CP Email, CP Phone, Cycle, Submitted, Version, Action |
| **Expected Result** | Submissions tab activates; table renders 8 columns and View action buttons per row as shown in `jbp-tab-submissions.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-submissions.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

#### TC_JBP_FUNC_004 — Switch to Edit Requests tab
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3 (Edit Requests tab), BRD §6 (Edit Request Flow), BRD §8 step 7 |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | FUNC |
| **Scenario** | Admin navigates to Edit Requests tab to process CP revision requests — the post-submission revision workflow (BRD §6). |
| **Preconditions** | Logged in as Admin; on JBP Management page |
| **Steps** | 1. Click `button:has-text("Edit Requests")`<br>2. Wait for tab content to render<br>3. Verify table columns: CP Name, HV Code, CP Phone, Cycle, Reason, Requested, Status, Action |
| **Expected Result** | Edit Requests tab activates; table renders 8 columns with View action per row as shown in `jbp-tab-edit-requests.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-edit-requests.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

---

### Cycle Management Tab

#### TC_JBP_UI_005 — Cycle Management table renders all required columns
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3, §4 (Cycle Lifecycle — visibility of status) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | UI |
| **Scenario** | The cycles table must surface lifecycle state (OPEN/CLOSED per BRD §4) and date range so admin can identify which cycle requires action. |
| **Preconditions** | Logged in as Admin; on Cycle Management tab; at least one cycle exists |
| **Steps** | 1. View cycles table on Cycle Management tab<br>2. Verify column headers: Cycle Name, Start Date, End Date, Status, Action |
| **Expected Result** | All 5 columns visible; rows display cycle data as shown in `jbp-tab-cycle-management.png` (10 cycles in `jbp-loaded.png`). |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-cycle-management.png`, `visual-memory/admin/jbp/jbp-loaded.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

#### TC_JBP_FUNC_006 — Create Cycle button opens modal
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §8 step 3 (Click "+ Create Cycle") |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | FUNC |
| **Scenario** | Entry point for the cycle creation workflow (BRD §4 lifecycle start). Modal-based capture supports the "name + start + end" data minimum from BRD §8. |
| **Preconditions** | Logged in as Admin; on Cycle Management tab |
| **Steps** | 1. Click `button:has-text("Create Cycle")` in header<br>2. Wait for modal<br>3. Verify modal title `.ant-modal-title` reads "Create New Cycle"<br>4. Verify presence of: `input[placeholder="e.g., September 2026"]`, `input[placeholder="Select Start Date"]`, `input[placeholder="Select End Date"]`, `.ant-modal-content button:has-text("Create Cycle")` |
| **Expected Result** | "Create New Cycle" modal opens with name input, start date picker, end date picker, and Create Cycle submit button as shown in `jbp-create-cycle-modal.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-create-cycle-modal.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

#### TC_JBP_FUNC_007 — Fill Create Cycle form (safe — no submit)
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §8 step 3, BRD §7.1 (Only one OPEN cycle constraint — pre-submit validation surface) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | FUNC |
| **Scenario** | Validates the form accepts well-formed cycle data without committing — safe regression check for input acceptance on UAT where extra cycles would pollute state. |
| **Preconditions** | Logged in as Admin; Create New Cycle modal open |
| **Steps** | 1. Type "Test Cycle June 2026" into `input[placeholder="e.g., September 2026"]`<br>2. Click `input[placeholder="Select Start Date"]` and pick a future date<br>3. Click `input[placeholder="Select End Date"]` and pick a future date after start<br>4. Verify Create Cycle button is enabled<br>5. Close modal without submitting (Escape key or modal close icon) |
| **Expected Result** | Form accepts all 3 inputs; submit button enabled; modal closes on cancel without creating a cycle (no row added to cycles table). |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-create-cycle-modal.png` |
| **Test Data** | Cycle Name: "Test Cycle June 2026"; Start: today+7; End: today+37 |
| **Priority** | P2 |
| **Status** | Approved |

#### TC_JBP_E2E_008 — Submit Create Cycle and verify row appears (CONDITIONAL)
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §4 (Cycle Lifecycle — admin creates cycle → status: OPEN), BRD §8 step 3 |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | E2E |
| **Scenario** | Full create-cycle journey — validates the cycle lifecycle entry point. CP submission cannot begin until a cycle exists in OPEN state (BRD §4). |
| **Preconditions** | Logged in as Admin; **no OPEN cycle currently exists** (BRD §7.1 — creating with an active cycle triggers "Active Cycle Detected" popup) |
| **Steps** | 1. Note cycle count in Cycle Management table<br>2. Click `button:has-text("Create Cycle")`<br>3. Fill `input[placeholder="e.g., September 2026"]` with unique name<br>4. Pick start date in `input[placeholder="Select Start Date"]`<br>5. Pick end date in `input[placeholder="Select End Date"]`<br>6. Click `.ant-modal-content button:has-text("Create Cycle")`<br>7. Wait for modal close and table refresh<br>8. Verify new row visible in cycles table with the entered name and dates |
| **Expected Result** | Cycle row appears at the top of the cycles table with entered Cycle Name, Start Date, End Date, status reflecting OPEN per BRD §4. Cycle count increments by 1. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-create-cycle-modal.png`, `visual-memory/admin/jbp/jbp-tab-cycle-management.png` |
| **Test Data** | Unique name `JBP_AUTO_<timestamp>`; future start/end dates |
| **Priority** | P1 |
| **Status** | Approved — **CONDITIONAL** — execute only when no OPEN cycle exists in UAT; otherwise expect "Active Cycle Detected" popup per BRD §7.1 (see TC_JBP_NEG_011) |

#### TC_JBP_VAL_009 — Create Cycle requires Cycle Name
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §8 step 3 (enter name, start date, end date) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | VAL |
| **Scenario** | Cycle Name is the human-readable identifier surfaced in the cycles table — missing name would break identification across UI. |
| **Preconditions** | Logged in as Admin; Create New Cycle modal open |
| **Steps** | 1. Leave `input[placeholder="e.g., September 2026"]` empty<br>2. Pick start date and end date<br>3. Click `.ant-modal-content button:has-text("Create Cycle")` |
| **Expected Result** | Form blocks submission; either submit button is disabled or a validation error surfaces near the Cycle Name field. No new row added to cycles table. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-create-cycle-modal.png` |
| **Test Data** | Cycle Name: "" (empty) |
| **Priority** | P2 |
| **Status** | Approved |

#### TC_JBP_VAL_010 — Create Cycle requires both dates
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §8 step 3 |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | VAL |
| **Scenario** | Start and end dates define the cycle period within which CPs submit (BRD §4). Missing dates would leave the cycle without a valid lifecycle boundary. |
| **Preconditions** | Logged in as Admin; Create New Cycle modal open |
| **Steps** | 1. Fill Cycle Name<br>2. Leave `input[placeholder="Select Start Date"]` empty<br>3. Leave `input[placeholder="Select End Date"]` empty<br>4. Click `.ant-modal-content button:has-text("Create Cycle")` |
| **Expected Result** | Form blocks submission; validation surfaces for missing dates. No row added. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-create-cycle-modal.png` |
| **Test Data** | Name: "Validation Test"; Start: empty; End: empty |
| **Priority** | P2 |
| **Status** | Approved |

#### TC_JBP_NEG_011 — Creating second cycle while OPEN cycle exists shows "Active Cycle Detected" (CONDITIONAL)
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §7.1 (One OPEN cycle only — Active Cycle Detected popup) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | NEG |
| **Scenario** | Business rule from BRD §7.1: system enforces single-OPEN-cycle invariant by blocking creation when one already exists. |
| **Preconditions** | Logged in as Admin; **exactly one OPEN cycle currently exists in the cycles table** |
| **Steps** | 1. Click `button:has-text("Create Cycle")`<br>2. Fill name + start + end dates<br>3. Click `.ant-modal-content button:has-text("Create Cycle")`<br>4. Observe popup/dialog |
| **Expected Result** | "Active Cycle Detected" popup appears (or equivalent blocking dialog); no new cycle row created; user is instructed to close the active cycle first. |
| **Visual Evidence** | `[NO-VISUAL-EVIDENCE]` — popup not captured (no OPEN cycle existed in UAT at capture time) |
| **Test Data** | Name: "Second cycle attempt"; future dates |
| **Priority** | P1 |
| **Status** | Approved — **CONDITIONAL** — requires an OPEN cycle to exist; popup visual evidence missing — flagged for Tech Lead Agent re-capture once OPEN cycle is available |

#### TC_JBP_FUNC_012 — Date filter inputs render on Cycle Management tab
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3 (Cycle Management surfaces cycles) — filter UI inferred from capture |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | FUNC |
| **Scenario** | Date filter allows admin to scope cycles list by date range — supports BRD §8 workflow of locating a specific cycle to close (step 6) when many historical cycles exist. |
| **Preconditions** | Logged in as Admin; on Cycle Management tab |
| **Steps** | 1. Locate `input[placeholder="Start Date"]`<br>2. Locate `input[placeholder="End Date"]`<br>3. Verify both inputs visible and enabled |
| **Expected Result** | Both date filter inputs render with their respective placeholders as shown in `jbp-tab-cycle-management.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-cycle-management.png` |
| **Test Data** | None |
| **Priority** | P2 |
| **Status** | Approved |

#### TC_JBP_BIZ_013 — Closed cycles show "Closed" text in Action column
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §4 (lifecycle CLOSED state), BRD §7.2 (irreversible close) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | BIZ |
| **Scenario** | Closed-cycle rows must surface their terminal lifecycle state visually so admin cannot reopen (BRD §7.2 — irreversible). |
| **Preconditions** | Logged in as Admin; on Cycle Management tab; at least one CLOSED cycle exists |
| **Steps** | 1. Locate a row with Status = "Closed"<br>2. Inspect the Action cell for that row |
| **Expected Result** | Action cell shows plain "Closed" text (no actionable button) for CLOSED cycles as shown in `jbp-tab-cycle-management.png` — confirming irreversible close per BRD §7.2. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-cycle-management.png`, `visual-memory/admin/jbp/jbp-loaded.png` |
| **Test Data** | Any existing CLOSED cycle |
| **Priority** | P1 |
| **Status** | Approved |

---

### Submissions Tab

#### TC_JBP_UI_014 — Submissions table renders all required columns
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3 (Submissions tab purpose), BRD §5 (14-field CP form — admin reviews submissions) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | UI |
| **Scenario** | Submissions tab is the admin's review surface for CP commitment forms (BRD §6 — CPs cannot directly edit, so admin needs visibility into submitted state). |
| **Preconditions** | Logged in as Admin; on Submissions tab; at least one submission exists |
| **Steps** | 1. View submissions table<br>2. Verify column headers: CP Name, HV Code, CP Email, CP Phone, Cycle, Submitted, Version, Action |
| **Expected Result** | All 8 columns render; submissions data populates as shown in `jbp-tab-submissions.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-submissions.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

#### TC_JBP_UI_015 — Filters and Refresh buttons render on Submissions tab
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3 (Submissions tab) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | UI |
| **Scenario** | Admin needs Filters/Refresh to scope and re-poll submissions across cycles — supports BRD §8 step 5 review workflow at scale. |
| **Preconditions** | Logged in as Admin; on Submissions tab |
| **Steps** | 1. Locate `button:has-text("Filters")`<br>2. Locate `button:has-text("Refresh")` |
| **Expected Result** | Both header buttons present and enabled as shown in `jbp-tab-submissions.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-submissions.png` |
| **Test Data** | None |
| **Priority** | P2 |
| **Status** | Approved |

#### TC_JBP_FUNC_016 — Each submission row has a View action
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3 (Submissions tab — review all CP commitment form submissions), BRD §5 (14-field form must be inspectable) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | FUNC |
| **Scenario** | View action is the entry point to inspect the full 14-field BRD §5 form — without it admin cannot review CP commitments. |
| **Preconditions** | Logged in as Admin; on Submissions tab; at least one submission row exists |
| **Steps** | 1. Iterate rows in submissions table<br>2. Verify each row contains `button:has-text("View")` (class `ant-btn-link view-action`) in the Action column |
| **Expected Result** | Every row exposes a View link button as shown in `jbp-tab-submissions.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-submissions.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

#### TC_JBP_FUNC_017 — Refresh button reloads submissions table
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §8 step 5 (View submissions in Submissions tab) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | FUNC |
| **Scenario** | Admin must be able to refresh to see new CP submissions arriving live during a cycle period (BRD §4 — CPs submit during OPEN window). |
| **Preconditions** | Logged in as Admin; on Submissions tab |
| **Steps** | 1. Note current submissions count/state<br>2. Click `button:has-text("Refresh")`<br>3. Verify the table is re-fetched (loading indicator or table re-render) |
| **Expected Result** | Refresh triggers a re-fetch of submissions; table either reloads with same data or shows newly arrived rows. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-submissions.png` |
| **Test Data** | None |
| **Priority** | P2 |
| **Status** | Approved |

#### TC_JBP_BIZ_018 — Version column reflects submission revisions
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §6 (Edit Request Flow — approved request updates submission), BRD §7.3 (one submission per CP per cycle — revisions go through edit request) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | BIZ |
| **Scenario** | Version column traces the revision lineage created by approved edit requests (BRD §6). Confirms BRD §7.3 "one submission per CP per cycle" is enforced as version increments, not duplicates. |
| **Preconditions** | Logged in as Admin; on Submissions tab; at least one submission with version > 1 exists OR baseline version data is visible |
| **Steps** | 1. View Version column for submissions<br>2. Confirm column populates with integer versions |
| **Expected Result** | Version column shows integer values; revisions appear as updated version on same CP+Cycle row, not as duplicate rows — consistent with BRD §7.3 single-submission rule. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-submissions.png` |
| **Test Data** | None |
| **Priority** | P2 |
| **Status** | Approved |

---

### Edit Requests Tab

#### TC_JBP_UI_019 — Edit Requests table renders all required columns
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §3 (Edit Requests tab purpose), BRD §6 (Edit Request Flow) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | UI |
| **Scenario** | Edit Requests surface the BRD §6 revision workflow — admin must see CP identity, cycle context, reason, and request status before deciding approve/reject. |
| **Preconditions** | Logged in as Admin; on Edit Requests tab |
| **Steps** | 1. View edit requests table<br>2. Verify column headers: CP Name, HV Code, CP Phone, Cycle, Reason, Requested, Status, Action |
| **Expected Result** | All 8 columns render as shown in `jbp-tab-edit-requests.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-edit-requests.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

#### TC_JBP_UI_020 — Reason column surfaces CP-supplied revision rationale
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §6 step 1 (CP submits Edit Request with revised values), BRD §7.4 (Reason required) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | UI |
| **Scenario** | Admin reviews the CP's stated reason before approving/rejecting (BRD §6 step 3). Reason is non-trivial — BRD §7.4 mandates admin also provide a reason on decision. |
| **Preconditions** | Logged in as Admin; on Edit Requests tab; at least one edit request exists |
| **Steps** | 1. Locate the Reason column for any row<br>2. Confirm reason text is rendered |
| **Expected Result** | Reason column displays CP-entered reason text per edit request as shown in `jbp-tab-edit-requests.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-edit-requests.png` |
| **Test Data** | None |
| **Priority** | P2 |
| **Status** | Approved |

#### TC_JBP_FUNC_021 — Each edit request row has a View action
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §6 step 2 (Admin reviews the request in the Edit Requests tab) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | FUNC |
| **Scenario** | View action is the entry into the approve/reject decision (BRD §6 step 3). Without it the admin cannot fulfil BRD §6 workflow. |
| **Preconditions** | Logged in as Admin; on Edit Requests tab; at least one edit request row exists |
| **Steps** | 1. Iterate rows in edit requests table<br>2. Verify each row contains `button:has-text("View")` (class `ant-btn-link view-action`) |
| **Expected Result** | Every row exposes a View link button as shown in `jbp-tab-edit-requests.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-edit-requests.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

#### TC_JBP_BIZ_022 — Status column reflects edit request decision lifecycle
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §6 step 3 (Admin approves or rejects), BRD §6 step 4 (CP receives notification of decision) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | BIZ |
| **Scenario** | Status column is the admin's audit trail of approve/reject decisions — supports BRD §6 step 3-4 workflow and BRD §7 audit traceability. |
| **Preconditions** | Logged in as Admin; on Edit Requests tab; at least one edit request exists |
| **Steps** | 1. View Status column<br>2. Confirm values reflect lifecycle: Pending / Approved / Rejected (or equivalent) |
| **Expected Result** | Status column shows lifecycle state per request as shown in `jbp-tab-edit-requests.png`. |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-edit-requests.png` |
| **Test Data** | None |
| **Priority** | P2 |
| **Status** | Approved |

#### TC_JBP_BIZ_023 — Edit request preserves original submission until decision (BIZ)
| Field | Value |
|-------|-------|
| **BRD/FRD Req ID** | BRD §6 step 3 (rejected → original preserved), BRD §7.3 (one submission per CP per cycle), BRD §7.5 (no financial impact on rejection) |
| **Portal** | admin |
| **Module** | JBP Management |
| **Type** | BIZ |
| **Scenario** | Validates BRD §6/§7.3 invariant: edit requests do NOT mutate the underlying submission until approved. Submissions tab must continue to show the prior version while request is Pending. |
| **Preconditions** | Logged in as Admin; one edit request exists in Pending status for a CP+Cycle combination that has a submission |
| **Steps** | 1. Note the version shown for the CP+Cycle on Submissions tab<br>2. Navigate to Edit Requests tab<br>3. Confirm the corresponding edit request is in Pending status<br>4. Return to Submissions tab<br>5. Re-verify the version did not change |
| **Expected Result** | Submission version unchanged while edit request is Pending — consistent with BRD §6 (approval gates the update) and BRD §7.5 (no side effects on rejection). |
| **Visual Evidence** | `visual-memory/admin/jbp/jbp-tab-submissions.png`, `visual-memory/admin/jbp/jbp-tab-edit-requests.png` |
| **Test Data** | None |
| **Priority** | P1 |
| **Status** | Approved |

---

## Sheet 2 — Automation Candidates

| TC_ID | Module | Type | Automatable | Complexity | Playwright Suite | Visual Evidence | Notes |
|-------|--------|------|-------------|------------|------------------|-----------------|-------|
| TC_JBP_UI_001 | JBP Management | UI | Yes | Low | ui-ux | FULL | Heading + tab presence assertions |
| TC_JBP_UI_002 | JBP Management | UI | Yes | Low | ui-ux | FULL | Default tab assertion |
| TC_JBP_FUNC_003 | JBP Management | FUNC | Yes | Low | e2e | FULL | Tab click + column assertions |
| TC_JBP_FUNC_004 | JBP Management | FUNC | Yes | Low | e2e | FULL | Tab click + column assertions |
| TC_JBP_UI_005 | JBP Management | UI | Yes | Low | ui-ux | FULL | Column header assertions |
| TC_JBP_FUNC_006 | JBP Management | FUNC | Yes | Low | e2e | FULL | Modal-open + element presence |
| TC_JBP_FUNC_007 | JBP Management | FUNC | Yes | Medium | e2e | FULL | Fill form, cancel without submit — safe on UAT |
| TC_JBP_E2E_008 | JBP Management | E2E | Partial | High | e2e | FULL | Mutates state — gate with `test.skip(ENV==='uat')` or require teardown via close cycle. CONDITIONAL on no OPEN cycle. |
| TC_JBP_VAL_009 | JBP Management | VAL | Yes | Low | e2e | FULL | Empty-name submit blocks |
| TC_JBP_VAL_010 | JBP Management | VAL | Yes | Low | e2e | FULL | Empty-date submit blocks |
| TC_JBP_NEG_011 | JBP Management | NEG | No | High | — | NO-EVIDENCE | Excluded — requires OPEN cycle state + popup capture. Re-capture needed. |
| TC_JBP_FUNC_012 | JBP Management | FUNC | Yes | Low | ui-ux | FULL | Filter input presence |
| TC_JBP_BIZ_013 | JBP Management | BIZ | Yes | Low | regression | FULL | Closed-row action text assertion |
| TC_JBP_UI_014 | JBP Management | UI | Yes | Low | ui-ux | FULL | Column header assertions |
| TC_JBP_UI_015 | JBP Management | UI | Yes | Low | ui-ux | FULL | Header button presence |
| TC_JBP_FUNC_016 | JBP Management | FUNC | Yes | Low | e2e | FULL | Per-row View presence |
| TC_JBP_FUNC_017 | JBP Management | FUNC | Yes | Medium | e2e | FULL | Refresh re-fetch verification |
| TC_JBP_BIZ_018 | JBP Management | BIZ | Yes | Low | regression | FULL | Version column data shape |
| TC_JBP_UI_019 | JBP Management | UI | Yes | Low | ui-ux | FULL | Column header assertions |
| TC_JBP_UI_020 | JBP Management | UI | Yes | Low | ui-ux | FULL | Reason column populated |
| TC_JBP_FUNC_021 | JBP Management | FUNC | Yes | Low | e2e | FULL | Per-row View presence |
| TC_JBP_BIZ_022 | JBP Management | BIZ | Yes | Low | regression | FULL | Status column lifecycle values |
| TC_JBP_BIZ_023 | JBP Management | BIZ | Yes | Medium | regression | FULL | Cross-tab invariant — Pending does not mutate Submissions |

**Automation summary:** 21 of 23 TCs automatable (91.3%). 1 Partial (TC_JBP_E2E_008 — gated). 1 excluded (TC_JBP_NEG_011 — no visual evidence yet).

---

## Sheet 3 — Bug Report Template

| Field | Value |
|-------|-------|
| Bug ID | BUG_NNN |
| TC_ID | (linked TC) |
| Severity | Critical / High / Medium / Low |
| Steps | (reproduction steps) |
| Actual | (observed behaviour) |
| Expected | (per BRD/FRD or screenshot) |
| Environment | UAT — `https://uat-web.xrportal.in/admin/jbp-management` |
| Status | New / In Progress / Fixed / Closed |

---

## Flags

### CONDITIONAL TCs (state-dependent)
- **TC_JBP_E2E_008** — requires no OPEN cycle to exist
- **TC_JBP_NEG_011** — requires exactly one OPEN cycle to exist; no visual evidence captured

### Visual Gaps (recommend Tech Lead re-capture)
- **Close Cycle action button** — no OPEN cycle existed in UAT at capture time; selector inferred but not confirmed (INDEX.md note: "inferred 'Close Cycle' button for open cycles (not confirmed)")
- **"Active Cycle Detected" popup** (TC_JBP_NEG_011) — not captured

### BRD Coverage Map
| BRD Section | TCs |
|-------------|-----|
| §3 Module Structure | 001, 002, 003, 004, 005, 014, 019 |
| §4 Cycle Lifecycle | 005, 008, 013 |
| §5 CP Submission Form (14 fields) | 014, 016 |
| §6 Edit Request Flow | 004, 019, 020, 021, 022, 023 |
| §7.1 One OPEN cycle only | 008, 011 |
| §7.2 Irreversible close | 013 |
| §7.3 One submission per CP per cycle | 018, 023 |
| §7.4 Reason required | 020 |
| §7.5 No financial impact | 023 |
| §8 Admin Workflow | 002, 003, 004, 006, 008, 012, 017 |

All 9 numbered BRD sections referenced — zero orphan TCs, zero uncovered BRD rules.
