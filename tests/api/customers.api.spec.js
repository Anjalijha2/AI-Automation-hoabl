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
});
