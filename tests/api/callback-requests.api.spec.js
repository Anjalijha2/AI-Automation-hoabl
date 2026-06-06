'use strict';

// tests/api/callback-requests.api.spec.js
// Sales Manager Portal — Callback Requests API / DB / Integration coverage.
//
// Ported from retained legacy SM_CB_* TCs documented in:
//   manual-qa-repository/07-execution/xlsx-cleanup-flags.md (Section 2-SM)
// These tests fill gaps that the v2 TC_CBR_* batch does not cover:
//   - KPI dashboard card numeric semantics + reconciliation
//   - Table↔API row reconciliation (SM_CB_028)
//   - Audit trail records (SM_CB_072, SM_CB_134)
//   - Buyer feedback token delivery on VC outcome (SM_CB_109)
//   - Role enforcement differences (SM vs SM-Admin vs CP vs Admin)
//   - FSD-verified API contract + Kaleyra integration
//
// Backend: https://uat-api.xrportal.in/
// Auth: SM JWT — resolved from SM_JWT env var or sales-manager.json storageState.
// All tests are stubs — implement against the live endpoint contract from FRD before unskipping.

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { ApiClient } = require('../../automation-repository/api/ApiClient');

const API_BASE_URL = 'https://uat-api.xrportal.in';

// ── Token resolution ────────────────────────────────────────────────────────
function resolveTokenFor(portal) {
  const envVar = { 'sales-manager': 'SM_JWT', 'admin': 'ADMIN_JWT', 'channel-partner': 'CP_JWT', 'buyer': 'BUYER_JWT' }[portal];
  if (envVar && process.env[envVar]) return process.env[envVar];
  const authPath = path.resolve(__dirname, `../../automation-repository/fixtures/.auth/${portal}.json`);
  if (!fs.existsSync(authPath)) return null;
  try {
    const state = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
    for (const origin of state.origins || []) {
      for (const item of origin.localStorage || []) {
        if (/token|jwt|auth/i.test(item.name) && item.value && item.value.length > 20) {
          return item.value.replace(/^Bearer\s+/i, '');
        }
      }
    }
    for (const c of state.cookies || []) {
      if (/token|jwt|auth/i.test(c.name) && c.value && c.value.length > 20) {
        return c.value.replace(/^Bearer\s+/i, '');
      }
    }
  } catch { /* ignore */ }
  return null;
}

test.describe('Callback Requests — API / DB / Integration', () => {
  let api;
  let smToken;

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request, API_BASE_URL);
    smToken = resolveTokenFor('sales-manager');
  });

  // ── KPI Dashboard (SM_CB_009 – SM_CB_020) ───────────────────────────────────
  test.describe('KPI Dashboard', () => {
    test('SM_CB_009 — FRD-CBR §KPI — "Total SM" card count matches API total sales-manager count', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_009: assert UI card value equals GET /callback-requests/kpi totalSm');
    });

    test('SM_CB_010 — FRD-CBR §KPI — "Total VC Request" fraction X / Y semantics correct', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_010: assert X = met requests, Y = total requests, format "X / Y"');
    });

    test('SM_CB_011 — FRD-CBR §KPI — "Total VC Pending" count semantics', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_011: assert count equals callback_requests where status = PENDING');
    });

    test('SM_CB_012 — FRD-CBR §KPI — "Invite Sent/Re-sent" card numeric semantics', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_012');
    });

    test('SM_CB_013 — FRD-CBR §KPI — "Meeting Done" card numeric semantics', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_013: assert count equals callback_requests where status = MEETING_DONE / CONFIRMED');
    });

    test('SM_CB_014 — FRD-CBR §KPI — "SM Feedback Done" card numeric semantics', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_014');
    });

    test('SM_CB_015 — FRD-CBR §KPI — "Customer Feedback Done" card numeric semantics', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_015');
    });

    test('SM_CB_016 — FRD-CBR §KPI — "Avg Rating by Customer" card format (decimal, 0..5)', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_016: assert value matches /^\\d\\.\\d$/ and 0 ≤ v ≤ 5');
    });

    test('SM_CB_017 — FRD-CBR §KPI — KPI cards refresh after VC outcome submission (cross-surface)', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_017: capture KPI snapshot, submit outcome, assert deltas');
    });

    test('SM_CB_018 — FRD-CBR §KPI — KPI card counts reconcile with table row counts', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_018: GET /kpi totals === GET /callback-requests aggregated counts');
    });

    test('SM_CB_019 — FRD-CBR §KPI — KPI cards render skeleton/loading state during fetch', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_019 (lower priority): assert skeleton loader visible before API resolves');
    });

    test('SM_CB_020 — FRD-CBR §KPI — KPI cards responsive layout at standard breakpoints', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_020 (low priority): may be better placed in UI/UX spec — re-categorise if needed');
    });
  });

  // ── Integration ─────────────────────────────────────────────────────────────
  test.describe('Integration', () => {
    test('SM_CB_028 — FRD-CBR §INT — table row count reconciles with API paginated total', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_028: GET /callback-requests?page=1&limit=10 total === count of rows rendered + pagination assertions');
    });

    test('SM_CB_109 — FRD-CBR §INT — buyer feedback token delivered on VC outcome capture', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_109: submit Capture VC Outcome → assert downstream token (SMS/email/Kaleyra) issued to buyer for feedback collection');
    });
  });

  // ── DB — Audit Trail ────────────────────────────────────────────────────────
  test.describe('DB — Audit Trail', () => {
    test('SM_CB_072 — FRD-CBR §DB — SM assignment audit trail record created on callback assign', async () => {
      test.skip(process.env.ENV === 'uat', 'DB test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_072: invoke db/queries/callback-requests.getSmAssignmentAuditTrail(callbackId) after assign → assert ≥1 record with new assignee + timestamp');
    });

    test('SM_CB_134 — FRD-CBR §DB — SM assignment record structure matches schema', async () => {
      test.skip(process.env.ENV === 'uat', 'DB test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_134: invoke db/queries/callback-requests.getSmAssignmentRecord(id) → assert columns: id, callback_request_id, assigned_to_user_id, assigned_by_user_id, created_at, updated_at, etc.');
    });
  });

  // ── Role Enforcement ────────────────────────────────────────────────────────
  test.describe('Role Enforcement', () => {
    test('SM_CB_125 — FRD-CBR §ROLE — regular SM sees only own-assigned rows (row-scoping)', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_125: assert GET /callback-requests as regular SM returns only rows where assigned_to = self.userId (depth beyond TC_CBR_BIZ_054)');
    });

    test('SM_CB_126 — FRD-CBR §ROLE — SM-Admin sees all managers\' rows', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_126: assert GET /callback-requests as SM-Admin returns rows across all SMs');
    });

    test('SM_CB_127 — FRD-CBR §ROLE — SM filter dropdown visible to SM-Admin only', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_127: assert regular SM API response does not include sm-filter metadata');
    });

    test('SM_CB_128 — FRD-CBR §ROLE — bulk-assign capability gated by role', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_128: assert POST /callback-requests/bulk-assign returns 403 for regular SM');
    });

    test('SM_CB_129 — FRD-CBR §ROLE — Create Callback Request capability gated by role', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_129');
    });

    test('SM_CB_130 — FRD-CBR §ROLE — Export capability gated by role', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_130');
    });

    test('SM_CB_131 — FRD-CBR §ROLE — Refresh capability gated by role', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_131');
    });

    test('SM_CB_132 — FRD-CBR §ROLE — role-switch session: same browser, different SM (medium priority)', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_132: re-auth as different SM in same context → assert response payload reflects new identity, no leakage');
    });

    test('SM_CB_133 — FRD-CBR §ROLE — API enforces 403 when role lacks capability', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_133: hit a privileged endpoint with insufficient role token → expect 403');
    });
  });

  // ── FSD-Verified + Kaleyra ──────────────────────────────────────────────────
  test.describe('FSD-Verified + Kaleyra', () => {
    test('SM_CB_FSD_135 — FRD-CBR §API — GET /callback-requests response shape (FSD-verified)', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_FSD_135: assert response envelope + data[] schema matches FSD contract');
    });

    test('SM_CB_FSD_136 — FRD-CBR §API — POST /callback-request create endpoint contract', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_FSD_136: assert 201 + returned id + body shape on create');
    });

    test('SM_CB_FSD_137 — FRD-CBR §API — PATCH /callback-request/:id outcome update contract', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_FSD_137: assert PATCH accepts outcome code, returns updated row');
    });

    test('SM_CB_FSD_138 — FRD-CBR §DB — callback_request table schema / ENUM values', async () => {
      test.skip(process.env.ENV === 'uat', 'DB test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_FSD_138: invoke db/queries/callback-requests.getStatusEnumValues() → assert expected ENUM set');
    });

    test('SM_CB_FSD_139 — FRD-CBR §DB — isAvailable flag effect on least-loaded assignment query', async () => {
      test.skip(process.env.ENV === 'uat', 'DB test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_FSD_139: assert SMs with is_available = false are excluded from assignment pool (per FSD-CORRECTION 2026-05-25, service.js:338-349)');
    });

    test('SM_CB_FSD_140 — FRD-CBR §INT — outcome submission creates vcOffer record in DB', async () => {
      test.skip(process.env.ENV === 'uat', 'INT test — skip on live UAT');
      test.skip(true, 'Stub — port from SM_CB_FSD_140: submit Capture VC Outcome → assert vc_offers row created with FK to callback_request (validates the outcome→offer chain at API/DB level vs TC_CBR_BIZ_032 UI-level)');
    });
  });
});
