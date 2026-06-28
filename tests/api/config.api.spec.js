'use strict';

// tests/api/config.api.spec.js
// Config module — Admin Portal API tests (Layer 2 — contract).
// Backend: https://uat-api.xrportal.in/. Admin JWT from saved admin.json.

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { ApiClient } = require('../../automation-repository/api/ApiClient');
const inventory = require('../../db/queries/inventory');

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
      if (/token|jwt|auth/i.test(c.name) && c.value && c.value.length > 20) return c.value.replace(/^Bearer\s+/i, '');
    }
  } catch { /* ignore */ }
  return null;
}

test.describe('Config — Admin Portal API', () => {
  let api;
  let token;

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request, API_BASE_URL);
    token = resolveAdminToken();
    test.skip(!token, 'No admin JWT — run auth:setup or set ADMIN_JWT');
  });

  test('ADM_CFG_FSD_057 — FS Feature1 §6 — PUT /admin/towers/status-update applies batch + persists', async () => {
    // ⛔ DESTRUCTIVE (real tower flip via API) — guarded. Safe design: send EVERY
    // tower at its CURRENT state with only one tower (Aura) flipped, so nothing else
    // can change; verify in DB; then restore Aura.
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — flips a tower via API; set ALLOW_DESTRUCTIVE=1');
    const TARGET = process.env.CFG_TOWER || 'Aura';
    test.info().annotations.push({ type: 'testData', description: `PUT towers/status-update batch; flip ${TARGET} (id) → restore; admin JWT; ALLOW_DESTRUCTIVE=1` });

    const all = await inventory.getTowers();
    const target = all.find((t) => t.tower_name === TARGET);
    expect(target, `${TARGET} must exist`).toBeTruthy();
    const before = Number(target.is_active);
    const flipped = before === 1 ? 0 : 1;
    const batch = (active) => ({ towers: all.map((t) => ({ id: t.id, isActive: t.id === target.id ? active : Number(t.is_active) })) });

    // 1. Apply batch with TARGET flipped → expect 2xx.
    const res = await api.put('/api/v1/admin/towers/status-update', batch(flipped), { token, timeout: 60_000 });
    expect(res.status, `status-update should succeed (got ${res.status})`).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    // 2. DB reflects the flip.
    const afterFlip = Number((await inventory.getTowerByName(TARGET)).is_active);
    console.log(`[ADM_CFG_FSD_057] ${TARGET} before=${before} flipped→${flipped} db=${afterFlip}`);
    expect(afterFlip).toBe(flipped);

    // 3. Restore TARGET to its original state + verify.
    const restore = await api.put('/api/v1/admin/towers/status-update', batch(before), { token, timeout: 60_000 });
    expect(restore.status).toBeGreaterThanOrEqual(200);
    expect(restore.status).toBeLessThan(300);
    const afterRestore = Number((await inventory.getTowerByName(TARGET)).is_active);
    console.log(`[ADM_CFG_FSD_057] ${TARGET} restored db=${afterRestore} (expected ${before})`);
    expect(afterRestore).toBe(before);
  });

  test('ADM_CFG_FSD_059 — update-units-status enforces only AVAILABLE↔RESERVED (§11.8)', async ({ request }) => {
    // ⛔ DESTRUCTIVE (self-restoring): flips disposable Crest unit 302 AVAILABLE→RESERVED
    // via the API and restores it. Also sends a BOOKED→AVAILABLE row expected to be REJECTED
    // (no mutation). Proves the endpoint allows only AVAILABLE↔RESERVED at the API layer.
    test.skip(process.env.ENV === 'uat' && !process.env.ALLOW_DESTRUCTIVE,
      'Skipped on UAT — flips a unit via API; set ALLOW_DESTRUCTIVE=1');
    test.info().annotations.push({ type: 'testData', description: 'POST /api/v1/admin/update-units-status multipart: Row A 302 (testUnit-547664512575) AVAILABLE→RESERVED = allowed; Row B 1001 (testUnit-547664514703, BOOKED)→AVAILABLE = rejected. Verify result file + DB; restore 302→AVAILABLE. admin JWT; ALLOW_DESTRUCTIVE=1.' });
    const X = require('xlsx');
    const inv = require('../../db/queries/inventory');
    const A = { unitId: 'testUnit-547664512575', unitNo: '302', typId: 'testtypology-1757656549935', typName: '1 BHK Growth Home' };
    const B = { unitId: 'testUnit-547664514703', unitNo: '1001', typId: 'testtypology-1757656549935', typName: '1 BHK Growth Home' };
    const URL = `${API_BASE_URL}/api/v1/admin/update-units-status`;
    const statusOf = async (uid) => String((await inv.getUnitByUnitId(uid)).status).toUpperCase();
    const buildBuf = (rows) => {
      const wb = X.utils.book_new();
      X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([
        ['Tower Name', 'Typology Id', 'Typology Name', 'Unit Id', 'Unit No', 'Status', 'Update (1/0)'], ...rows,
      ]), 'S1');
      return X.write(wb, { type: 'buffer', bookType: 'xlsx' });
    };
    const post = async (buf) => request.post(URL, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: { doc: { name: 'units.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: buf } },
      timeout: 60_000,
    });
    const parseRows = async (res) => {
      try {
        const wb = X.read(Buffer.from(await res.body()), { type: 'buffer' });
        return X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      } catch { return null; }
    };

    // Preconditions.
    expect(await statusOf(A.unitId), 'A must start AVAILABLE').toBe('AVAILABLE');
    expect(await statusOf(B.unitId), 'B must start BOOKED').toBe('BOOKED');

    // Mixed file: allowed (A) + disallowed (B).
    const res = await post(buildBuf([
      ['Crest', A.typId, A.typName, A.unitId, A.unitNo, 'RESERVED', 1],
      ['Crest', B.typId, B.typName, B.unitId, B.unitNo, 'AVAILABLE', 1],
    ]));
    expect(res.status(), `expected 200 (got ${res.status()})`).toBe(200);
    const rows = await parseRows(res);
    const rowA = (rows || []).find((r) => String(r[3]) === A.unitId) || [];
    const rowB = (rows || []).find((r) => String(r[3]) === B.unitId) || [];
    const aRes = String(rowA[rowA.length - 1] || ''), bRes = String(rowB[rowB.length - 1] || '');
    const aDb = await statusOf(A.unitId), bDb = await statusOf(B.unitId);
    console.log(`[ADM_CFG_FSD_059] A:"${aRes}" db=${aDb} | B:"${bRes}" db=${bDb}`);
    // Allowed transition applied.
    expect(aRes).toMatch(/RESERVED/i);
    expect(aDb).toBe('RESERVED');
    // Disallowed transition rejected — no mutation.
    expect(bRes).toMatch(/cannot change|invalid|not\s|error|booked/i);
    expect(bDb).toBe('BOOKED');

    // Restore A → AVAILABLE.
    const restore = await post(buildBuf([['Crest', A.typId, A.typName, A.unitId, A.unitNo, 'AVAILABLE', 1]]));
    expect(restore.status()).toBe(200);
    expect(await statusOf(A.unitId)).toBe('AVAILABLE');
  });

  test('ADM_CFG_FSD_060 — PATCH /api/v1/admin/units/:id accepts pricing + status (§11.9)', async () => {
    // FINDING: the per-unit edit endpoint documented in FS §11.9 (BA correction
    // GAP-TL-047, "New Feature") is NOT deployed on UAT — GET/PATCH against
    // /api/v1/admin/units/:id (numeric PK 7007 and unit_id), /unit/:id, and the
    // /units collection all return the API's 404 envelope {"message":"Not found"}.
    // Cannot verify until the endpoint ships. Re-enable when available.
    test.info().annotations.push({ type: 'testData', description: 'VERIFY-WITH-DEV — PATCH /api/v1/admin/units/:id returns 404 "Not found" on UAT (probed PK 7007 + unit_id + /unit + /units; all 404). Endpoint from FS §11.9 GAP-TL-047 "New Feature" not yet deployed. Re-test when shipped.' });
    test.skip(true, 'VERIFY-WITH-DEV — units/:id PATCH endpoint not deployed on UAT (404 Not found)');
  });
});
