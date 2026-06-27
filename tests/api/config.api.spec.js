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
});
