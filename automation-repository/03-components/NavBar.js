// automation-repository/03-components/NavBar.js
// Reusable navbar component — shared across all page objects.

class NavBar {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    // ── Locators ──────────────────────────────────────────────────────
    this.nav             = page.locator('nav, [data-testid="navbar"]');
    this.logoLink        = page.locator('[data-testid="logo"], .logo a');
    this.customersLink   = page.getByRole('link', { name: /customers/i });
    this.towersLink      = page.getByRole('link', { name: /towers/i });
    this.allocationLink  = page.getByRole('link', { name: /allocation/i });
    this.configLink      = page.getByRole('link', { name: /config|cms/i });
    this.profileMenu     = page.locator('[data-testid="profile-menu"]');
  }

  async navigateTo(section) {
    const links = {
      customers:  this.customersLink,
      towers:     this.towersLink,
      allocation: this.allocationLink,
      config:     this.configLink,
    };
    const link = links[section.toLowerCase()];
    if (!link) throw new Error(`Unknown nav section: ${section}`);
    await link.waitFor({ state: 'visible' });
    await link.click();
  }

  async isVisible() {
    await this.nav.waitFor({ state: 'visible' });
    return true;
  }
}

module.exports = { NavBar };
