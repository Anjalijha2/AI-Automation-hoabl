// automation-repository/api/ApiClient.js
// Wraps Playwright APIRequestContext for structured HTTP calls.
// Returns { status, body } — never throws on non-2xx, callers assert status.

class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request  — Playwright request fixture
   * @param {string} [baseURL]  — overrides process.env.API_BASE_URL when provided
   */
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = baseURL || process.env.API_BASE_URL || '';
    this.defaultHeaders = { 'Content-Type': 'application/json' };
  }

  // ── Core methods — return { status, body } ──────────────────────────────────

  async get(path, { token, params, timeout } = {}) {
    const res = await this.request.get(`${this.baseURL}${path}`, {
      headers: this._headers(token),
      params,
      ...(timeout ? { timeout } : {}),
    });
    return this._wrap(res);
  }

  async post(path, body = {}, { token, timeout } = {}) {
    const res = await this.request.post(`${this.baseURL}${path}`, {
      headers: this._headers(token),
      data: body,
      ...(timeout ? { timeout } : {}),
    });
    return this._wrap(res);
  }

  async put(path, body = {}, { token, timeout } = {}) {
    const res = await this.request.put(`${this.baseURL}${path}`, {
      headers: this._headers(token),
      data: body,
      ...(timeout ? { timeout } : {}),
    });
    return this._wrap(res);
  }

  async delete(path, { token } = {}) {
    const res = await this.request.delete(`${this.baseURL}${path}`, {
      headers: this._headers(token),
    });
    return this._wrap(res);
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _headers(token) {
    return token
      ? { ...this.defaultHeaders, Authorization: `Bearer ${token}` }
      : { ...this.defaultHeaders };
  }

  async _wrap(res) {
    let body;
    try { body = await res.json(); } catch { body = null; }
    return { status: res.status(), body };
  }
}

module.exports = { ApiClient };
