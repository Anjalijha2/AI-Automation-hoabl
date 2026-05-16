// automation-repository/pages/admin/DashboardPage.js

const { BasePage } = require('../../base/BasePage');

class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    // ── Locators ────────────────────────────────────────────────────────
    this.sidebar        = page.locator('[data-testid="sidebar"], nav.sidebar, aside');
    this.pageHeading    = page.locator('h1, [data-testid="page-heading"]');
    this.logoutButton   = page.getByRole('button', { name: /logout|sign out/i });
    this.profileMenu    = page.locator('[data-testid="profile-menu"], .profile-menu');
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  async navigate() {
    await this.goto('/customers');
  }

  async expectLoaded() {
    await this.expectURL(/customers|dashboard/);
    await this.expectVisible(this.sidebar);
  }

  // ── Actions ────────────────────────────────────────────────────────────
  async logout() {
    await this.click(this.profileMenu);
    await this.click(this.logoutButton);
    await this.expectURL(/\/admin\/?$/);
  }
}

module.exports = { DashboardPage };
