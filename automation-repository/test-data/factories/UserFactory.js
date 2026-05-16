// automation-repository/test-data/factories/UserFactory.js
// Generate deterministic or random test data payloads.

let _counter = 0;

const UserFactory = {
  /**
   * Build a user payload (does NOT create in the backend).
   * @param {Partial<object>} overrides
   */
  build(overrides = {}) {
    _counter++;
    return {
      name:   `Test User ${_counter}`,
      mobile: `9${String(_counter).padStart(9, '0')}`,
      role:   'member',
      ...overrides,
    };
  },

  admin(overrides = {}) {
    return this.build({ role: 'admin', ...overrides });
  },
};

module.exports = { UserFactory };
