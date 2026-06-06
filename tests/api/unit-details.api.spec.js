'use strict';

// tests/api/unit-details.api.spec.js
// Buyer Portal — Unit Details API / DB / Integration / Edge coverage.
//
// Ported from retained legacy BYR_UNIT_* TCs documented in:
//   manual-qa-repository/07-execution/xlsx-cleanup-flags.md (Section 2-BUYER)
// These tests fill gaps that the v3 TC_BUYUD_* batch does not cover:
//   - Backend HTTP error contracts (400 / 401 / 404 / 500)
//   - Azure Blob SAS URL integration assertions
//   - Underlying SQL query structure (CASE WHEN ordering, composite concat, ENUM, PAID filter)
//   - Edge data states (duplicate orders, empty milestones, broken Blob URL, disabled CTA)
//
// Backend: https://uat-api.xrportal.in/
// Auth: buyer JWT — resolved from BUYER_JWT env var or buyer.json storageState.
// All tests are stubs — implement against the live endpoint contract from FRD before unskipping.

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { ApiClient } = require('../../automation-repository/api/ApiClient');

const API_BASE_URL = 'https://uat-api.xrportal.in';

// ── Token resolution ────────────────────────────────────────────────────────
function resolveBuyerToken() {
  if (process.env.BUYER_JWT) return process.env.BUYER_JWT;
  const authPath = path.resolve(__dirname, '../../automation-repository/fixtures/.auth/buyer.json');
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

test.describe('Unit Details — API / DB / EDGE', () => {
  let api;
  let token;

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request, API_BASE_URL);
    token = resolveBuyerToken();
  });

  // ── Negative — HTTP error responses ─────────────────────────────────────────
  test.describe('Negative — HTTP error responses', () => {
    test('BYR_UNIT_026 — FRD-UNITDET §API — GET /hcf/unit-detail returns 400 for wrong registrationNumber format', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_026: assert 400 + error body when registrationNumber is malformed');
      // Arrange: malformed registrationNumber (e.g. spaces, non-alphanumeric)
      // Act: const res = await api.get('/api/v1/hcf/unit-detail', { token, params: { registrationNumber: 'BAD FORMAT' } });
      // Assert: expect(res.status).toBe(400); expect(res.body.success).toBe(false);
    });

    test('BYR_UNIT_027 — FRD-UNITDET §API — GET /hcf/unit-detail returns 400 when required query params are missing', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_027: assert 400 + "Missing required query params" message');
      // Act: const res = await api.get('/api/v1/hcf/unit-detail', { token });
      // Assert: expect(res.status).toBe(400);
    });

    test('BYR_UNIT_028 — FRD-UNITDET §API — GET /hcf/unit-detail returns 500 for expired auth token', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_028: assert 500 when JWT is expired');
      // Arrange: const expiredToken = '<expired-jwt>';
      // Act: const res = await api.get('/api/v1/hcf/unit-detail', { token: expiredToken, params: { unitId: '<valid>' } });
      // Assert: expect(res.status).toBe(500);
    });

    test('BYR_UNIT_029 — FRD-UNITDET §API — GET /hcf/unit-detail/<invalid-route> returns 404 at API level', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_029: assert 404 from API server (distinct from Next.js 404)');
      // Act: const res = await api.get('/api/v1/hcf/unit-detail/non-existent-path', { token });
      // Assert: expect(res.status).toBe(404);
    });

    test('BYR_UNIT_054 — FRD-UNITDET §API — GET /hcf/unit-detail returns 401 mid-session when JWT expires', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_054: 401 on mid-session token expiry — distinct from BYR_UNIT_028 (500 wrong/expired) which exercises a different code path');
      // Act: const res = await api.get('/api/v1/hcf/unit-detail', { token: '<mid-session-expired>' });
      // Assert: expect(res.status).toBe(401);
    });

    test('BYR_UNIT_055 — FRD-UNITDET §API — GET /hcf/unit-detail returns 400 "Could not fetch unit data" for valid unitId mapped to no data', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_055: 400 + specific error message when unitId resolves to no rows');
      // Act: const res = await api.get('/api/v1/hcf/unit-detail', { token, params: { unitId: '<orphan-uuid>' } });
      // Assert: expect(res.status).toBe(400); expect(res.body.message).toMatch(/Could not fetch unit data/i);
    });
  });

  // ── Integration — Azure Blob / SAS URL ──────────────────────────────────────
  test.describe('Integration — Azure Blob / SAS URL', () => {
    test('BYR_UNIT_030 — FRD-UNITDET §INT — download URL is a valid Azure Blob SAS URL', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_030: assert response.downloadUrl matches Azure Blob SAS pattern (host + sv/ss/sp/sig query params)');
      // Act: const res = await api.get('/api/v1/hcf/unit-detail', { token, params: { unitId: '<winner-unit>' } });
      // Assert: expect(res.body.data.downloadUrl).toMatch(/\.blob\.core\.windows\.net\/.*\?.*(sig|sv|sp)=/);
    });

    test('BYR_UNIT_046 — FRD-UNITDET §EDGE — broken Azure Blob URL handled gracefully on client', async () => {
      test.skip(process.env.ENV === 'uat', 'API test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_046: API returns valid unitId but Blob URL 404s — verify graceful degradation (no crash, user-facing error)');
      // Distinct from BYR_UNIT_025 (NEG, broken image placeholder) — this is the Blob storage path.
    });
  });

  // ── DB — Query structure ────────────────────────────────────────────────────
  test.describe('DB — Query structure', () => {
    test('BYR_UNIT_031 — FRD-UNITDET §DB — SQL CASE WHEN returns buyer\'s own unit first in result ordering', async () => {
      test.skip(process.env.ENV === 'uat', 'DB test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_031: invoke db/queries/unit-details.getUnitDetailsOrdered(buyerId) and assert own unit is row[0]');
      // Use db/queries/unit-details.js — never inline SQL in spec.
    });

    test('BYR_UNIT_032 — FRD-UNITDET §DB — composite unit string uses "||" delimiter in SQL concat', async () => {
      test.skip(process.env.ENV === 'uat', 'DB test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_032: assert composite column matches /[^|]+\\|\\|[^|]+/ pattern');
      // Use db/queries/unit-details.getCompositeUnitString(unitId).
    });

    test('BYR_UNIT_033 — FRD-UNITDET §DB — hcfTransactionStatus ENUM contains expected values', async () => {
      test.skip(process.env.ENV === 'uat', 'DB test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_033: assert ENUM set on hcf_transactions.hcf_transaction_status (PAID, PENDING, FAILED, REFUNDED, ...)');
      // Use db/queries/unit-details.getHcfTransactionStatusEnum().
    });

    test('BYR_UNIT_035 — FRD-UNITDET §DB — query filters to hcfTransactionStatus = PAID only', async () => {
      test.skip(process.env.ENV === 'uat', 'DB test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_035: assert returned rows all have hcf_transaction_status = "PAID"');
      // Use db/queries/unit-details.getPaidTransactionsForUnit(unitId).
    });
  });

  // ── Edge cases ──────────────────────────────────────────────────────────────
  test.describe('Edge cases', () => {
    test('BYR_UNIT_034 — FRD-UNITDET §EDGE — duplicate payment orders for same unit handled without API error', async () => {
      test.skip(process.env.ENV === 'uat', 'EDGE test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_034: seed two payment orders for same unitId; assert API still returns 200 and dedupes or surfaces both correctly per FRD');
    });

    test('BYR_UNIT_053 — FRD-UNITDET §EDGE — empty milestones array does not crash KYC success page or downloaded document', async () => {
      test.skip(process.env.ENV === 'uat', 'EDGE test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_053: assert empty milestones[] returns 200 + downloadable doc generates without exception');
    });

    test('BYR_UNIT_059 — FRD-UNITDET §EDGE — "Download your Unit Details" button is disabled when unit is not in payable state', async () => {
      test.skip(process.env.ENV === 'uat', 'EDGE test — skip on live UAT');
      test.skip(true, 'Stub — port from BYR_UNIT_059: re-scope to /kyc?unitId=<b64> per Section 3-BUYER correction; assert button disabled when WINNER status absent or KYC incomplete');
      // Note: TC_BUYUD_FUNC_004 covers the enabled path. This covers the disabled path.
    });
  });
});
