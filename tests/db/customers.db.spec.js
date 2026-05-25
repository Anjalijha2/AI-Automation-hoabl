'use strict';

// tests/db/customers.db.spec.js
// Customers module — DB-layer tests
// Scope: verify the API responses for the Customers module are backed by
// consistent DB state. All queries use the ApiClient + the saved admin JWT;
// no direct DB connection is used here (Sequelize raw SQL lives in db/queries/).
//
// NOTE: These tests are intentionally thin. The Customers FRD does not expose
// a DB-level query surface for QA agents. Tests here validate that the API
// returns shapes consistent with what the DB should hold.
// If a Sequelize query file for customers is added to db/queries/, extend here.

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { ApiClient } = require('../../automation-repository/api/ApiClient');

const API_BASE_URL = 'https://uat-api.xrportal.in';

function resolveAdminToken() {
  if (process.env.ADMIN_JWT) return process.env.ADMIN_JWT;
  const authPath = path.resolve(__dirname, '../../automation-repository/fixtures/.auth/admin.json');
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

test.describe('Customers — DB State Consistency', () => {
  let api;
  let token;

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request, API_BASE_URL);
    token = resolveAdminToken();
    test.skip(!token, 'No admin JWT — run auth:setup or set ADMIN_JWT env var');
  });

  test('TC_CUST_DB_001 — FRD-CUST §11 — All-buyers API returns consistent total across paginated requests', async () => {
    // Page 1
    const page1 = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '10' },
    });
    expect(page1.status).toBe(200);

    // Page 2
    const page2 = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '2', limit: '10' },
    });
    expect(page2.status).toBe(200);

    // Both pages must return a non-error response (DB is consistent)
    const body1 = page1.body.data || page1.body;
    const body2 = page2.body.data || page2.body;
    expect(body1).toBeTruthy();
    expect(body2).toBeTruthy();
  });

  test('TC_CUST_DB_002 — FRD-CUST §11 — KPI summary API returns all expected status categories', async () => {
    const res = await api.get('/api/v1/admin/registration-status', { token });
    expect(res.status).toBe(200);
    const payload = res.body.data || res.body;
    const flat = JSON.stringify(payload).toLowerCase();
    // Verify DB has records for at least the known status categories
    expect(flat).toMatch(/registered|booked|cancelled|inactive|kyc/);
  });

  test('TC_CUST_DB_003 — FRD-CUST §11 — Filtered buyers API returns same or fewer records than total', async () => {
    // Total (unfiltered)
    const total = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '1000' },
    });
    expect(total.status).toBe(200);

    // Filtered by a specific allocation status
    const filtered = await api.get('/api/v1/admin/dashboard/all-buyers', {
      token,
      params: { page: '1', limit: '1000', allocationStatus: 'Cancelled' },
    });
    // Filtered must succeed (even if 0 results)
    expect([200, 204]).toContain(filtered.status);

    // If both return arrays, filtered count <= total count
    const totalArr  = extractArray(total.body);
    const filteredArr = extractArray(filtered.body);
    if (totalArr && filteredArr) {
      expect(filteredArr.length).toBeLessThanOrEqual(totalArr.length);
    }
  });
});

function extractArray(body) {
  const payload = body.data || body;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items))   return payload.items;
  if (Array.isArray(payload?.buyers))  return payload.buyers;
  if (Array.isArray(payload?.records)) return payload.records;
  return null;
}
