// automation-repository/03-components/Modal.js
// Reusable modal/dialog component — shared across page objects.

class Modal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    // ── Locators ──────────────────────────────────────────────────────
    this.container     = page.locator('[role="dialog"], .modal, [data-testid="modal"]');
    this.title         = page.locator('[role="dialog"] h2, .modal-title');
    this.confirmButton = page.getByRole('button', { name: /confirm|yes|ok|submit/i });
    this.cancelButton  = page.getByRole('button', { name: /cancel|no|close/i });
    this.closeIcon     = page.locator('[data-testid="modal-close"], .modal-close');
  }

  async waitForOpen() {
    await this.container.waitFor({ state: 'visible' });
  }

  async waitForClose() {
    await this.container.waitFor({ state: 'hidden' });
  }

  async confirm() {
    await this.confirmButton.waitFor({ state: 'visible' });
    await this.confirmButton.click();
    await this.waitForClose();
  }

  async cancel() {
    await this.cancelButton.waitFor({ state: 'visible' });
    await this.cancelButton.click();
    await this.waitForClose();
  }

  async getTitle() {
    await this.title.waitFor({ state: 'visible' });
    return this.title.textContent();
  }
}

module.exports = { Modal };
