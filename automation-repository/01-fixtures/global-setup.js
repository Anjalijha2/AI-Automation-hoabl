// automation-repository/01-fixtures/global-setup.js
// Runs once before all tests — DB seed, mock server startup, env validation.
// Exported function is called by Playwright via globalSetup in playwright.config.js

async function globalSetup(config) {
  // ── Environment validation ─────────────────────────────────────────────
  const baseURL = process.env.BASE_URL || config.use?.baseURL;
  if (!baseURL) {
    throw new Error('BASE_URL not set. Copy .env.example → .env and fill in values.');
  }

  // ── Placeholder: add DB seed or mock server startup here ──────────────
  // Example:
  //   await seedDatabase();
  //   await startMockServer();

  console.log(`[global-setup] Target: ${baseURL}`);
}

module.exports = globalSetup;
