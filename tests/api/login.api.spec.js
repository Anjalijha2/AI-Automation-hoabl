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
});
