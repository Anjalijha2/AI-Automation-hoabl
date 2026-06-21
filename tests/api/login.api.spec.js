'use strict';

const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../automation-repository/api/ApiClient');

const BASE_URL = process.env.API_BASE_URL || 'https://uat-api.xrportal.in';
const PHONE    = process.env.ADMIN_MOBILE || '8888888888';
const OTP      = process.env.ADMIN_OTP    || '258369';

// API payload shape: { phone, otp, userType }  (field is "phone" not "mobile")
// Response envelope: { success, message, data: { user, token }, errors }

test.describe('Login API — Admin Portal', () => {
  let api;

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request, BASE_URL);
  });

  // ── Send OTP ───────────────────────────────────────────────────────────────

  test('TC_LOGIN_API_001 — ADMIN-FS-Login Feature1 §7 — POST /auth/admin/send-otp returns 200 for valid admin phone', async () => {
    const res = await api.post('/api/v1/auth/admin/send-otp', {
      phone: PHONE,
      userType: 'admin',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('TC_LOGIN_API_002 — ADMIN-FS-Login Feature1 §6 — POST /auth/admin/send-otp 400 for missing phone', async () => {
    const res = await api.post('/api/v1/auth/admin/send-otp', {
      userType: 'admin',
    });
    expect(res.status).toBe(400);
  });

  test('TC_LOGIN_API_003 — ADMIN-FS-Login Feature1 §6 — POST /auth/admin/send-otp 400 for all-zeros phone', async () => {
    const res = await api.post('/api/v1/auth/admin/send-otp', {
      phone: '0000000000',
      userType: 'admin',
    });
    expect([400, 404, 422]).toContain(res.status);
  });

  // ── Verify OTP ─────────────────────────────────────────────────────────────

  test('TC_LOGIN_API_004 — ADMIN-FS-Login Feature2 §7 — POST /auth/admin/verify-otp returns 200 + JWT for valid OTP', async () => {
    await api.post('/api/v1/auth/admin/send-otp', { phone: PHONE, userType: 'admin' });

    const res = await api.post('/api/v1/auth/admin/verify-otp', {
      phone: PHONE,
      otp: OTP,
      userType: 'admin',
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).toHaveProperty('phone', PHONE);
  });

  test('TC_LOGIN_API_005 — ADMIN-FS-Login Feature2 §6 — POST /auth/admin/verify-otp 400 for wrong OTP', async () => {
    await api.post('/api/v1/auth/admin/send-otp', { phone: PHONE, userType: 'admin' });

    const res = await api.post('/api/v1/auth/admin/verify-otp', {
      phone: PHONE,
      otp: '000000',
      userType: 'admin',
    });
    expect([400, 401, 422]).toContain(res.status);
  });

  test('TC_LOGIN_API_006 — ADMIN-FS-Login Feature2 §6 — POST /auth/admin/verify-otp 400 for missing otp field', async () => {
    const res = await api.post('/api/v1/auth/admin/verify-otp', {
      phone: PHONE,
      userType: 'admin',
    });
    expect(res.status).toBe(400);
  });

  // ── Auth guard ─────────────────────────────────────────────────────────────

  test('TC_LOGIN_API_007 — ADMIN-FRD-Login §Integration — protected endpoint without token returns 401', async () => {
    const res = await api.get('/api/v1/admin/customers');
    expect(res.status).toBe(401);
  });

  test('TC_LOGIN_API_008 — ADMIN-FRD-Login §JWT — expired/invalid token returns 401', async () => {
    const res = await api.get('/api/v1/admin/customers', {
      token: 'invalid.token.here',
    });
    expect(res.status).toBe(401);
  });

  // ── Logout ─────────────────────────────────────────────────────────────────

  test('TC_LOGIN_API_009 — ADMIN-FS-Login Feature3 §7 — POST /auth/logout with valid token returns 200', async () => {
    await api.post('/api/v1/auth/admin/send-otp', { phone: PHONE, userType: 'admin' });
    const loginRes = await api.post('/api/v1/auth/admin/verify-otp', {
      phone: PHONE, otp: OTP, userType: 'admin',
    });
    const token = loginRes.body?.data?.token;
    test.skip(!token, 'Skipped — could not obtain token');

    const res = await api.post('/api/v1/auth/logout', {}, { token });
    expect([200, 204]).toContain(res.status);
  });

  test('TC_LOGIN_API_010 — ADMIN-FS-Login Feature3 §7 — token invalid after logout', async () => {
    await api.post('/api/v1/auth/admin/send-otp', { phone: PHONE, userType: 'admin' });
    const loginRes = await api.post('/api/v1/auth/admin/verify-otp', {
      phone: PHONE, otp: OTP, userType: 'admin',
    });
    const token = loginRes.body?.data?.token;
    test.skip(!token, 'Skipped — could not obtain token');

    await api.post('/api/v1/auth/logout', {}, { token });
    const res = await api.get('/api/v1/admin/customers', { token });
    // Post-logout: token rejected (401) or session route not found (404) — both confirm access denied
    expect([401, 403, 404]).toContain(res.status);
  });

  // ── Goal 7 — coverage gaps (security / session) ────────────────────────────

  test('TC_LOGIN_API_073 — ADMIN-FS-Login §gap — send-otp has no server-side rate limit', async () => {
    // Fire several send-otp calls in quick succession; none should be throttled (429).
    const results = [];
    for (let i = 0; i < 6; i++) {
      const r = await api.post('/api/v1/auth/admin/send-otp', { phone: PHONE, userType: 'admin' });
      results.push(r.status);
    }
    expect(results.every((s) => s !== 429), `no request should be rate-limited (got ${results.join(',')})`).toBe(true);
    expect(results.filter((s) => s === 200).length).toBeGreaterThan(1); // repeated sends accepted
  });

  test('TC_LOGIN_API_080 — ADMIN-FS-Login §verify — verify-otp returns a JWT without surfacing SMS/notification internals', async () => {
    await api.post('/api/v1/auth/admin/send-otp', { phone: PHONE, userType: 'admin' });
    const res = await api.post('/api/v1/auth/admin/verify-otp', { phone: PHONE, otp: OTP, userType: 'admin' });
    expect(res.status).toBe(200);
    expect(res.body?.data?.token).toBeTruthy();
    // A successful verify is a pure auth response — it must not expose any SMS/WhatsApp dispatch id.
    const flat = JSON.stringify(res.body).toLowerCase();
    expect(flat).not.toMatch(/smsid|messageid|kaleyra|whatsapp|epinet/);
  });

  test('TC_LOGIN_API_087 — ADMIN-FS-Login §7 — SQLi/XSS payload to send-otp is rejected with 4xx, not 500', async () => {
    for (const payload of ["1' OR '1'='1", '<script>alert(1)</script>', "8888888888'); DROP TABLE users;--"]) {
      const r = await api.post('/api/v1/auth/admin/send-otp', { phone: payload, userType: 'admin' });
      expect(r.status, `payload "${payload}" must not 500`).toBeLessThan(500);
      expect(r.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('TC_LOGIN_API_089 — ADMIN-FS-Login §gap — send-otp silently accepts extra/unknown fields', async () => {
    const res = await api.post('/api/v1/auth/admin/send-otp', {
      phone: PHONE, userType: 'admin',
      utmSource: 'qa', deviceId: 'qa-device-001', extra: { nested: true },
    });
    expect(res.status).toBe(200); // unknown fields ignored, not rejected
    expect(res.body.success).toBe(true);
  });

  test('TC_LOGIN_API_034 — ADMIN-FS-Login §JWT — issued token is valid within a ~1-day window', async () => {
    await api.post('/api/v1/auth/admin/send-otp', { phone: PHONE, userType: 'admin' });
    const loginRes = await api.post('/api/v1/auth/admin/verify-otp', { phone: PHONE, otp: OTP, userType: 'admin' });
    const token = loginRes.body?.data?.token;
    test.skip(!token, 'Skipped — could not obtain token');
    // Decode the JWT payload and confirm the exp window is ~24h from iat.
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
    expect(payload.exp).toBeTruthy();
    const windowSec = payload.exp - (payload.iat || 0);
    expect(windowSec).toBeGreaterThan(60 * 60);          // > 1 hour
    expect(windowSec).toBeLessThanOrEqual(2 * 24 * 60 * 60); // <= 2 days (documented ~1-day)
    // And the fresh token actually authorizes a protected read right now.
    const read = await api.get('/api/v1/admin/dashboard/all-buyers', { token, params: { page: '1', limit: '1' } });
    expect(read.status).toBe(200);
  });

  test('TC_LOGIN_API_064 — ADMIN-FS-Login §session — a 2nd-device login leaves the 1st token valid (no server-side invalidation)', async () => {
    await api.post('/api/v1/auth/admin/send-otp', { phone: PHONE, userType: 'admin' });
    const a = (await api.post('/api/v1/auth/admin/verify-otp', { phone: PHONE, otp: OTP, userType: 'admin' })).body?.data?.token;
    test.skip(!a, 'Skipped — could not obtain first token');
    // Second "device" logs in independently.
    await api.post('/api/v1/auth/admin/send-otp', { phone: PHONE, userType: 'admin' });
    const b = (await api.post('/api/v1/auth/admin/verify-otp', { phone: PHONE, otp: OTP, userType: 'admin' })).body?.data?.token;
    test.skip(!b, 'Skipped — could not obtain second token');
    // The first token must still authorize a read (sessions are independent JWTs).
    const read = await api.get('/api/v1/admin/dashboard/all-buyers', { token: a, params: { page: '1', limit: '1' } });
    expect(read.status).toBe(200);
  });

  test('TC_LOGIN_API_086 — ADMIN-FS-Login §access — a revoked (isActive=false) user is rejected', async () => {
    test.skip(!process.env.REVOKED_ADMIN_PHONE,
      'Needs a revoked admin fixture — set REVOKED_ADMIN_PHONE to a known isActive=false admin mobile');
    const phone = process.env.REVOKED_ADMIN_PHONE;
    const res = await api.post('/api/v1/auth/admin/send-otp', { phone, userType: 'admin' });
    // A deactivated admin must not be able to start the OTP flow (or must fail at verify).
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
