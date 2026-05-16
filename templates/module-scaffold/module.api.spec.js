'use strict';

const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../automation-repository/api/ApiClient');

test.describe('__MODULE__ API', () => {
  let api;

  test.beforeAll(async () => {
    api = new ApiClient(process.env.API_BASE_URL || 'https://uat-api.xrportal.in');
  });

  test('TC___MODULE___API_001 — REQ_ID — GET /__endpoint__ returns 200 with valid schema', async () => {
    const res = await api.get('/__endpoint__', { token: process.env.ADMIN_TOKEN });
    expect(res.status).toBe(200);
    // expect(res.body).toMatchSchema(expectedSchema);
  });
});
