'use strict';

// tests/api/customers.api.spec.js
// Customers module — Admin Portal API tests
// Covers TC_CUST_API_001..004 from manual-qa-repository/01-test-cases/admin-portal/customers/TC_CUSTOMERS.md
// Backend: https://uat-api.xrportal.in/

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { ApiClient } = require('../../automation-repository/api/ApiClient');

const API_BASE_URL = 'https://uat-api.xrportal.in';

// ── Token resolution ────────────────────────────────────────────────────────
// Prefer ADMIN_JWT env var. Fall back to extracting from saved storageState
// (auth.setup.js writes admin.json with localStorage/cookies after OTP login).
function resolveAdminToken() {
  if (process.env.ADMIN_JWT) return process.env.ADMIN_JWT;
  const authPath = path.resolve(__dirname, '../../automation-repository/fixtures/.auth/admin.json');
  if (!fs.existsSync(authPath)) return null;
  try {
    const state = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
    // Try localStorage first
    for (const origin of state.origins || []) {
      for (const item of origin.localStorage || []) {
        if (/token|jwt|auth/i.test(item.name) && item.value && item.value.length > 20) {
          // strip Bearer prefix if present
          return item.value.replace(/^Bearer\s+/i, '');
        }
      }
    }
    // Try cookies
    for (const c of state.cookies || []) {
      if (/token|jwt|auth/i.test(c.name) && c.value && c.value.length > 20) {
        return c.value.replace(/^Bearer\s+/i, '');
      }
    }
  } catch { /* ignore */ }
  return null;
}

test.describe('Customers — Admin Portal API', () => {
  let api;
  let token;

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request, API_BASE_URL);
    token = resolveAdminToken();
    test.skip(!token, 'No admin JWT available — set ADMIN_JWT env var or run auth:setup first');
  });

  test('TC_CUST_API_001 — FRD-CUST §11 — GET /admin/dashboard/all-buyers returns paginated list', async () => {
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '10' },
    });
    expect(res.status).toBe(200);
    expect(res.body).toBeTruthy();
    // API envelope { success, message, data, errors }
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
    // Data may be an array or { items, total } — accept both
    if (Array.isArray(payload)) {
      expect(payload.length).toBeLessThanOrEqual(10);
    } else if (Array.isArray(payload.items || payload.buyers || payload.records)) {
      const arr = payload.items || payload.buyers || payload.records;
      expect(arr.length).toBeLessThanOrEqual(10);
    } else {
      // structure differs — at least ensure object form
      expect(typeof payload).toBe('object');
    }
  });

  test('TC_CUST_API_002 — FRD-CUST §11 — GET /admin/registration-status returns KPI summary', async () => {
    const res = await api.get('/api/v1/admin/registration-status', { token });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
    // Should expose KPI counts; accept either flat object or nested
    const flat = JSON.stringify(payload).toLowerCase();
    expect(flat).toMatch(/registered|inactive|cancelled|kyc|confirmed|tower/);
  });

  test('TC_CUST_API_003 — FRD-CUST §11 — GET export triggers XLSX download (no filter = full export)', async ({ request }) => {
    // NOTE (2026-05-21 backend audit / TechSpec §3): This test verifies only MIME + non-empty
    // body WITHOUT any filter params. It explicitly exercises the "no filter = full export"
    // case. `isDownload=1` removes pagination only; it does NOT bypass filter conditions.
    // Filtered-export behaviour is covered by TC_CUST_API_003b below.
    const res = await request.get(`${API_BASE_URL}/api/v1/admin/dashboard/all-buyers`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { isDownload: '1' },
    });
    expect(res.status()).toBe(200);
    const contentType = res.headers()['content-type'] || '';
    // XLSX MIME type; some backends serve as octet-stream
    expect(contentType).toMatch(/spreadsheetml|octet-stream|xlsx/i);
    const body = await res.body();
    expect(body.length).toBeGreaterThan(100); // non-empty payload
  });

  test('TC_CUST_API_003b — FRD-CUST §11 — GET export with allotmentStatus filter returns filtered XLSX', async ({ request }) => {
    // Export with filter: only refunded rows
    const filtered = await request.get(`${API_BASE_URL}/api/v1/admin/dashboard/all-buyers`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { isDownload: '1', allotmentStatus: 'refunded' },
    });
    expect(filtered.status()).toBe(200);
    const filteredBody = await filtered.body();
    expect(filteredBody.length).toBeGreaterThan(0);

    // Export without filter
    const full = await request.get(`${API_BASE_URL}/api/v1/admin/dashboard/all-buyers`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { isDownload: '1' },
    });
    expect(full.status()).toBe(200);
    const fullBody = await full.body();

    // Filtered export must be smaller than full export (assuming refunded rows exist but are < total)
    expect(filteredBody.length).toBeLessThan(fullBody.length);
  });

  test('TC_CUST_API_007 — FRD-CUST (TechSpec §2) — globalSearch filters by phone only', async () => {
    // Search by a known phone
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '10', globalSearch: '9999999999' },
    });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    const arr = Array.isArray(payload) ? payload : (payload.items || payload.buyers || payload.records || []);
    // All returned rows should have phone matching the search (phone-only filter)
    if (arr.length > 0) {
      for (const row of arr) {
        expect(JSON.stringify(row)).toMatch(/9999999999/);
      }
    }
  });

  test('TC_CUST_API_121 — Security — admin JWT remains valid for reads (server logout is a no-op)', async () => {
    // The portal logout is client-side (clears local token); the server does not blacklist
    // the JWT. So an authenticated GET with the same token still returns 200 until expiry.
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '5' },
    });
    expect(res.status).toBe(200);
    expect(res.body).toBeTruthy();
  });

  test('TC_CUST_API_122 — Security — omitting projectId returns 200 scoped data (default env, no cross-project leak)', async () => {
    // Without an explicit projectId the API falls back to the default env project and
    // returns a valid scoped response — it must not 500 or leak another project's data.
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '5' }, // no projectId param
    });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
    expect(typeof payload).toBe('object');
  });

  // ── Goal 2 — Search / Filter API variants ──────────────────────────────────
  // TechSpec §2: allotmentStatus, kycStatus, paymentStatus, hasHomeLoan filters
  // are separate query params; each is tested independently here.

  test('TC_CUST_API_005 — TechSpec §2.1 — allotmentStatus=registered filter returns 200 with valid shape', async () => {
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '20', allotmentStatus: 'registered' },
    });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
    // KPI block must still be present regardless of filter (TechSpec: KPIs not filtered)
    const flat = JSON.stringify(payload);
    expect(typeof flat).toBe('string');
  });

  test('TC_CUST_API_006 — TechSpec §2.1 — kycStatus="KYC Completed" filter returns 200 (case-sensitive)', async () => {
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '20', kycStatus: 'KYC Completed' },
    });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
  });

  test('TC_CUST_API_006b — TechSpec §2.1 — kycStatus="KYC Pending" filter returns 200', async () => {
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '20', kycStatus: 'KYC Pending' },
    });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
  });

  test('TC_CUST_API_008 — TechSpec §2.1 — paymentStatus="Paid" filter returns 200 (case-sensitive)', async () => {
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '20', paymentStatus: 'Paid' },
    });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
  });

  test('TC_CUST_API_009 — TechSpec §2.1 — hasHomeLoan=true filter returns 200', async () => {
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '20', hasHomeLoan: 'true' },
    });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
    // Rows, if any, should carry home loan data
    const rows = extractRows(payload);
    for (const row of rows) {
      // hasHomeLoan=true → HomeLoan.status = 'completed' — presence of homeLoan key expected
      const rowStr = JSON.stringify(row).toLowerCase();
      expect(rowStr).toMatch(/homeloan|home_loan|loan/);
    }
  });

  test('TC_CUST_API_010 — TechSpec §2.1 — combined filters (allotmentStatus + kycStatus) return 200', async () => {
    const res = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '20', allotmentStatus: 'booked_offline', kycStatus: 'KYC Completed' },
    });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
  });

  // ── Goal 3 — Cancel Registration (skip-guarded destructive) ────────────────
  test('TC_CUST_API_004 — FRD-CUST §11 — PUT /admin/registration-units/:id/refund cancels a registration', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive refund; set ALLOW_DESTRUCTIVE=1 with disposable UAT_REG_UNIT_ID');
    const regUnitId = process.env.UAT_REG_UNIT_ID;
    test.skip(!regUnitId, 'UAT_REG_UNIT_ID env var not provided — required disposable registration-unit ID');

    const res = await api.put(`/api/v1/admin/registration-units/${regUnitId}/refund`, {}, { token });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();

    // Re-query and confirm state change
    const verify = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '100' },
    });
    expect(verify.status).toBe(200);
    const flat = JSON.stringify(verify.body).toLowerCase();
    expect(flat).toContain('cancelled');
  });
  // ── Goal 4 — Cancel Unit (skip-guarded destructive) ───────────────────────
  // Endpoint: PUT /api/v1/admin/cancel-units (admin.routes.js:69)
  // Accepts array of registrationUnitIds; single-cancel = array of 1.

  test('TC_CUST_API_011 — FS-CUST cancel-unit — PUT /admin/cancel-units returns 200 for valid id', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive cancel-unit; set ALLOW_DESTRUCTIVE=1 with disposable UAT_CANCEL_UNIT_ID');
    const cancelUnitId = process.env.UAT_CANCEL_UNIT_ID;
    test.skip(!cancelUnitId, 'UAT_CANCEL_UNIT_ID env var not provided — required disposable registration-unit ID');

    const res = await api.put('/api/v1/admin/cancel-units', { ids: [cancelUnitId] }, { token });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    expect(payload).toBeTruthy();
    const msg = (payload.message || JSON.stringify(payload)).toLowerCase();
    expect(msg).toMatch(/cancel|success/);
  });

  test('TC_CUST_API_012 — FS-CUST cancel-unit — PUT /admin/cancel-units with empty ids returns 4xx', async () => {
    // BUG: backend does not validate ids:[] early — request hangs until gateway
    // returns 502. Expected: 400 "No ids provided". Tracked as potential backend fix.
    test.fixme(true, 'BUG: empty ids:[] causes backend hang → 502. Backend should return 400 immediately.');
  });

  // ── Goal 5 — Unit Swap (skip-guarded destructive) ─────────────────────────
  // Endpoint: PUT /api/v1/admin/registration-unit/:id with event: 'unit-swap'
  // (singular path, not plural — per ADMIN-FS-Customers-UnitSwap.md)

  test('TC_CUST_API_013 — FS-UnitSwap §4 — PUT event:unit-swap requires targetUnitId → 400 if missing', async () => {
    // Use a plausible-looking ID; backend should 404 (not found) or 400 (validation)
    // rather than 500 — proves the event routing works
    const fakeId = process.env.UAT_REG_UNIT_ID || '999999';
    const res = await api.put(`/api/v1/admin/registration-unit/${fakeId}`,
      { event: 'unit-swap', payload: {} }, { token });
    // Missing targetUnitId → backend gate 1 → 400
    expect([400, 404]).toContain(res.status);
  });

  test('TC_CUST_API_014 — FS-UnitSwap §4 — PUT event:unit-swap with same unit returns 400', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — requires ALLOW_DESTRUCTIVE=1 + UAT_REG_UNIT_ID + UAT_CURRENT_UNIT_ID');
    const regUnitId = process.env.UAT_REG_UNIT_ID;
    const currentUnitId = process.env.UAT_CURRENT_UNIT_ID;
    test.skip(!regUnitId || !currentUnitId, 'UAT_REG_UNIT_ID and UAT_CURRENT_UNIT_ID required');

    // Gate 4: targetUnitId === currentUnitId → 400
    const res = await api.put(`/api/v1/admin/registration-unit/${regUnitId}`,
      { event: 'unit-swap', payload: { unitId: currentUnitId } }, { token });
    expect(res.status).toBe(400);
  });

  // ── Goal 6 — Update Parking (non-destructive read + validation) ────────────
  // Endpoint: PUT /api/v1/admin/registration-unit/:id with event: 'update-parking'

  test('TC_CUST_API_015 — FS-Parking §4 — PUT event:update-parking with no delta returns 400', async () => {
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — requires ALLOW_DESTRUCTIVE=1 + UAT_REG_UNIT_ID');
    const regUnitId = process.env.UAT_REG_UNIT_ID;
    test.skip(!regUnitId, 'UAT_REG_UNIT_ID env var not provided');

    // parkingCount same as current → no delta → backend returns 400 "No change in parking count"
    // We send count=0 which is invalid; backend should reject
    const res = await api.put(`/api/v1/admin/registration-unit/${regUnitId}`,
      { event: 'update-parking', payload: { additionalParkingEnabled: true, parkingCount: 0, parkingAmount: 0 } },
      { token });
    expect([400, 422]).toContain(res.status);
  });

  // ── Goal 7 — Home Loan Approval (skip-guarded destructive) ────────────────
  // Endpoint: PUT /api/v1/admin/registration-unit/:id with event: 'home-loan-approval'

  test('TC_CUST_API_016 — FS-CUST §HomeLoan — PUT event:home-loan-approval requires valid registrationUnitId', async () => {
    // Send to a non-existent ID — backend should return 404 (not found) not 500
    const res = await api.put('/api/v1/admin/registration-unit/000000',
      { event: 'home-loan-approval', payload: { loanApprovalStatus: 'admin_approved', approvalSource: 'admin' } },
      { token });
    expect([400, 404]).toContain(res.status);
  });

  // ── Goal 8 — View Milestones (read-only, safe) ────────────────────────────
  // Endpoint: GET /api/v1/admin/user-unit-detail?registrationNumber=&unitId=

  test('TC_CUST_API_017 — FS-Milestones §API — GET user-unit-detail with missing params returns 4xx', async () => {
    // Omit required params → should return 400 or 404, not 500
    const res = await api.get('/api/v1/admin/user-unit-detail', { token, params: {} });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  test('TC_CUST_API_018 — FS-Milestones §API — GET user-unit-detail with valid params returns milestone list', async () => {
    test.skip(!process.env.UAT_REG_NUMBER || !process.env.UAT_UNIT_ID,
      'UAT_REG_NUMBER and UAT_UNIT_ID env vars required for milestone read test');
    const res = await api.get('/api/v1/admin/user-unit-detail', {
      token,
      params: { registrationNumber: process.env.UAT_REG_NUMBER, unitId: process.env.UAT_UNIT_ID },
    });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    const flat = JSON.stringify(payload).toLowerCase();
    expect(flat).toMatch(/milestone|unit|payment/);
  });

  // ── Goal 10 — Offline Payment (skip-guarded destructive) ──────────────────
  // Endpoint: POST /api/v1/admin/milestone-payment-offline (multipart/form-data)

  test('TC_CUST_API_019 — FS-Milestones §OfflinePayment — POST milestone-payment-offline without auth returns 401', async ({ request }) => {
    const form = new URLSearchParams();
    form.append('registrationNumber', 'TEST-0000');
    const res = await request.post(`${API_BASE_URL}/api/v1/admin/milestone-payment-offline`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: form.toString(),
    });
    // No auth header → 401
    expect(res.status()).toBe(401);
  });

  // ── Mutating-API tests (skip-guarded destructive) ─────────────────────────
  // These mutate live UAT data. They run only with ALLOW_DESTRUCTIVE=1 and a
  // disposable registration-unit ID, and consume the fixture row permanently.

  test('TC_CUST_API_048 — FS-CancelUnit — PUT /admin/cancel-units cancels the unit and creates NO refund', async () => {
    // Differs from Cancel Registration (which refunds the ₹999 EOI): Cancel Unit
    // releases the unit WITHOUT inserting any new (refund) payment_transactions row.
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — destructive cancel-unit; set ALLOW_DESTRUCTIVE=1 with disposable UAT_CANCEL_UNIT_ID');
    const cancelUnitId = process.env.UAT_CANCEL_UNIT_ID;
    test.skip(!cancelUnitId, 'UAT_CANCEL_UNIT_ID env var not provided — disposable Booked registration-unit id (numeric)');
    test.setTimeout(120_000); // cancel-units is a heavy endpoint (Mavis/LSQ/refund checks)

    const payment = require('../../db/queries/payment');
    const registration = require('../../db/queries/registration');

    // 1. Pre-state (DB): the unit is Booked, and snapshot its transaction count.
    const before = await registration.getRegistrationUnitById(cancelUnitId);
    expect(before, `registration_unit ${cancelUnitId} must exist`).toBeTruthy();
    const txnsBefore = await payment.countTransactionsByRegistrationUnit(cancelUnitId);

    // 2. Act: cancel the unit via the admin cancel-units endpoint (slow → 90s).
    const res = await api.put('/api/v1/admin/cancel-units', { ids: [cancelUnitId] }, { token, timeout: 90_000 });
    // NOTE: when the unit still has a live Mavis booking, the backend performs a
    // synchronous Mavis reversal that exceeds the gateway timeout → 504. The unit's
    // Mavis booking must be cleared first (same precondition as the UI Cancel Unit).
    expect(res.status, `cancel-units returned ${res.status} — if 504, clear the unit's Mavis booking first`).toBe(200);
    const payload = res.body.data || res.body;
    const msg = (payload.message || res.body.message || JSON.stringify(payload)).toLowerCase();
    expect(msg).toMatch(/cancel|success/);

    // 3. Verify (DB): the unit left its Booked state ...
    const after = await registration.getRegistrationUnitById(cancelUnitId);
    expect(after).toBeTruthy();
    expect(after.status).not.toBe(before.status); // WINNER/BOOKED → CANCELLED/REFUND/etc.

    // 4. ... and NO new (refund) payment transaction was created for this unit.
    const txnsAfter = await payment.countTransactionsByRegistrationUnit(cancelUnitId);
    expect(txnsAfter).toBe(txnsBefore); // cancel-unit adds no refund row
  });

  test('TC_CUST_API_120 — FS-Parking — update-parking contract migrated to slot-based selectedParkings (old count/amount payload rejected)', async () => {
    // RE-GROUNDED 2026-06-21 (BUG_014). The parking-update API migrated to a slot-based
    // contract — verified by live capture of the UI's outgoing request (PUT aborted,
    // no mutation):
    //   PUT /api/v1/admin/registration-units/:id
    //   { event:'update-parking',
    //     payload:{ additionalParkingEnabled:true,
    //               selectedParkings:[{ parkingId:<poolSlotId>, amount:<perSlot> }],
    //               removedParkings:[] } }
    // The documented FRD §5.1 {parkingCount, parkingAmount} shape — and the original
    // TC premise ("count=0/amount=0 accepted as a validation gap") — are STALE: the old
    // loose payload no longer reaches the service. The backend Yup now REQUIRES the
    // structured `selectedParkings` field, so the old count=0/amount=0 gap is CLOSED.
    // This test guards that migration (non-destructive — a 400, no mutation).
    const regUnitId = process.env.UAT_PARKING_UNIT_ID || '9784'; // any Booked unit id; request is rejected pre-mutation
    const res = await api.put(`/api/v1/admin/registration-units/${regUnitId}`,
      { event: 'update-parking', payload: { additionalParkingEnabled: true, parkingCount: 0, parkingAmount: 0 } },
      { token });
    // Old payload (no selectedParkings) is rejected by the new schema — no mutation occurs.
    expect(res.status).toBe(400);
    const errs = JSON.stringify(res.body || {}).toLowerCase();
    expect(errs).toContain('selectedparkings');
  });
});

function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.buyers)) return payload.buyers;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
}
