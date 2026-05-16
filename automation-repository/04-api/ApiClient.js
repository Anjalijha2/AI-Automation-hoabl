// automation-repository/api/ApiClient.js
// Use API calls to set up / tear down state WITHOUT going through the UI.
// Keeps tests fast and deterministic.

class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   */
  constructor(request) {
    this.request = request;
    this.baseURL = process.env.API_BASE_URL || process.env.BASE_URL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // --- Generic HTTP methods ---
  async get(path, params = {}) {
    const res = await this.request.get(`${this.baseURL}${path}`, {
      headers: this.headers,
      params,
    });
    await this._assertOk(res);
    return res.json();
  }

  async post(path, body = {}) {
    const res = await this.request.post(`${this.baseURL}${path}`, {
      headers: this.headers,
      data: body,
    });
    await this._assertOk(res);
    return res.json();
  }

  async put(path, body = {}) {
    const res = await this.request.put(`${this.baseURL}${path}`, {
      headers: this.headers,
      data: body,
    });
    await this._assertOk(res);
    return res.json();
  }

  async delete(path) {
    const res = await this.request.delete(`${this.baseURL}${path}`, {
      headers: this.headers,
    });
    await this._assertOk(res);
  }

  // --- Private ---
  async _assertOk(response) {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`API ${response.status()} — ${response.url()}\n${body}`);
    }
  }
}

module.exports = { ApiClient };
