/**
 * JBP MANAGEMENT PAGE — XR Portal Admin
 * ========================================
 * URL: https://uat-web.xrportal.in/admin/jbp-management
 *
 * Layout:
 *   Tabs      — Cycle Management | Submissions | Edit Requests
 *   Cycles    — Cycle Date Range picker + Create Cycle button
 *   Table     — Cycle Name | Start Date | End Date | Status | Action
 *   Statuses  — OPEN (green) | CLOSED (grey)
 *   Action    — "Close Cycle" for OPEN, "Closed" (disabled) for CLOSED
 */

const { BasePage } = require('../base/BasePage');

class JBPManagementPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  async navigate() {
    await this.page.goto(`${this.baseUrl}/jbp-management`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await this.waitForNetworkIdle();
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────────

  async getTabNames() {
    const tabs = await this.page.locator('.ant-tabs-tab').allTextContents();
    // Ant Design duplicates tab text — deduplicate
    return [...new Set(tabs.map(t => t.trim()).filter(Boolean))];
  }

  async clickTab(name) {
    await this.page.locator('.ant-tabs-tab').filter({ hasText: name }).first().click();
    await this.waitForNetworkIdle();
  }

  async getActiveTab() {
    return (await this.page.locator('.ant-tabs-tab-active').first().textContent())?.trim() ?? '';
  }

  // ── Cycle Management Table ────────────────────────────────────────────────────

  async getTableHeaders() {
    const ths = await this.page.locator('.ant-table thead th, .ant-table-content thead th').allTextContents();
    if (ths.length) return ths.map(t => t.trim()).filter(Boolean);
    // Fallback
    return (await this.page.locator('thead th').allTextContents()).map(t => t.trim()).filter(Boolean);
  }

  async getTableRowCount() {
    // Scope to .ant-table-body to exclude calendar picker tbody rows
    return await this.page.locator('.ant-table-body tbody tr, .ant-table-content tbody tr').count();
  }

  /** Returns all visible rows as { cycleName, startDate, endDate, status } */
  async getAllCycleRows() {
    // Scope to .ant-table-body to exclude calendar picker tbody rows
    const rows = await this.page.locator('.ant-table-body tbody tr, .ant-table-content tbody tr').all();
    const result = [];
    for (const row of rows) {
      const cells = await row.locator('td').allTextContents();
      result.push({
        cycleName:  cells[0]?.trim() ?? '',
        startDate:  cells[1]?.trim() ?? '',
        endDate:    cells[2]?.trim() ?? '',
        status:     cells[3]?.trim() ?? '',
        action:     cells[4]?.trim() ?? '',
      });
    }
    return result;
  }

  /** Returns the first OPEN cycle row */
  async getOpenCycle() {
    const rows = await this.getAllCycleRows();
    return rows.find(r => r.status === 'OPEN') ?? null;
  }

  /** Returns count of rows matching status ('OPEN' or 'CLOSED') */
  async countByStatus(status) {
    const rows = await this.getAllCycleRows();
    return rows.filter(r => r.status === status).length;
  }

  // ── Cycle Date Range Filter ───────────────────────────────────────────────────

  /**
   * Applies the Cycle Date Range filter.
   * startDate / endDate format: 'YYYY-MM-DD'
   */
  async filterByDateRange(startDate, endDate) {
    // Click the start date input to open the picker
    const startInput = this.page.locator('input[placeholder="Start Date"]').first();
    await startInput.click({ force: true });
    await this.page.waitForTimeout(500);

    await startInput.fill(startDate);
    await this.page.keyboard.press('Tab');
    await this.page.waitForTimeout(400);

    // Fill End Date
    const endInput = this.page.locator('input[placeholder="End Date"]').first();
    await endInput.fill(endDate);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(400);

    // Click outside the picker to ensure it closes
    await this.page.mouse.click(200, 200);
    await this.page.waitForTimeout(300);

    // Wait for picker dropdown to fully close
    await this.page.locator('.ant-picker-dropdown').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {
      // Last resort: press Escape
      this.page.keyboard.press('Escape').catch(() => {});
    });
    await this.waitForNetworkIdle();
  }

  /** Clears the Cycle Date Range filter by clicking the clear (×) icon */
  async clearDateRangeFilter() {
    const clearBtn = this.page.locator('.ant-picker-range .ant-picker-clear, .ant-picker-clear').first();
    // Hover to make clear button visible
    await this.page.locator('.ant-picker-range').first().hover();
    await this.page.waitForTimeout(300);
    const isVisible = await clearBtn.isVisible().catch(() => false);
    if (isVisible) {
      await clearBtn.click();
    } else {
      // Fallback: clear both inputs manually
      const startInput = this.page.locator('input[placeholder="Start Date"]').first();
      await startInput.triple_click?.() || await startInput.click({ clickCount: 3 });
      await startInput.press('Delete');
      await this.page.keyboard.press('Escape');
    }
    await this.waitForNetworkIdle();
  }

  /** Returns current values in Start Date / End Date inputs */
  async getDateRangeValues() {
    const start = await this.page.locator('input[placeholder="Start Date"]').first().inputValue();
    const end   = await this.page.locator('input[placeholder="End Date"]').first().inputValue();
    return { start, end };
  }

  // ── Create Cycle Modal ────────────────────────────────────────────────────────

  /** Clicks the "+ Create Cycle" header button */
  async clickCreateCycleBtn() {
    await this.page.locator('button:has-text("Create Cycle")').first().click();
    await this.page.locator('.ant-modal-content').waitFor({ state: 'visible', timeout: 8_000 });
    await this.page.waitForTimeout(400);
  }

  /**
   * Fills the Create New Cycle modal.
   * Computes today's date dynamically in DD-MM-YYYY format (modal picker format).
   * NOTE: Does NOT press Escape — modal closes on Escape, so we use Tab/Enter only.
   */
  async fillCreateCycleModal(cycleName) {
    const modal = this.page.locator('.ant-modal-content');

    // Today in DD-MM-YYYY (format shown in modal date inputs: e.g. 07-04-2026)
    const now  = new Date();
    const dd   = String(now.getDate()).padStart(2, '0');
    const mm   = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${dd}-${mm}-${yyyy}`;

    // Modal has 3 inputs: [0]=Cycle Name, [1]=Start Date picker, [2]=End Date picker
    const allInputs = modal.locator('input');

    // Cycle Name
    await allInputs.nth(0).clear();
    await allInputs.nth(0).fill(cycleName);
    await this.page.waitForTimeout(200);

    // Start Date — click input, fill date, Tab to move to End Date (keeps modal open)
    await allInputs.nth(1).click({ force: true });
    await this.page.waitForTimeout(300);
    await allInputs.nth(1).fill(dateStr);
    await allInputs.nth(1).press('Tab');
    await this.page.waitForTimeout(400);

    // End Date — now focused via Tab; fill date and Enter to confirm
    await allInputs.nth(2).fill(dateStr);
    await allInputs.nth(2).press('Enter');
    await this.page.waitForTimeout(400);

    // Click the modal title to dismiss any open calendar without pressing Escape
    await modal.locator('.ant-modal-title, h5, h4, h3').first().click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(200);
  }

  /** Clicks the "Create Cycle" submit button inside the modal */
  async submitCreateCycleModal() {
    const modal = this.page.locator('.ant-modal-content');
    await modal.locator('button:has-text("Create Cycle")').first().click();
    await this.page.waitForTimeout(600);
  }

  /** Closes the Create New Cycle modal via the × button */
  async closeCreateCycleModal() {
    await this.page.locator('.ant-modal-close').first().click().catch(() => {});
    await this.page.locator('.ant-modal-content').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
  }

  // ── Active Cycle Detected dialog ──────────────────────────────────────────────

  /** Returns true if the "Active Cycle Detected" confirmation is visible */
  async isActiveCycleDetectedVisible() {
    return await this.page.locator('text=Active Cycle Detected').isVisible().catch(() => false);
  }

  /** Clicks "Yes, Create Cycle" in the Active Cycle Detected dialog */
  async confirmActiveCycleCreate() {
    await this.page.locator('button:has-text("Yes, Create Cycle")').first().click();
    await this.page.waitForTimeout(600);
  }

  /** Clicks "Cancel" in the Active Cycle Detected dialog */
  async cancelActiveCycleCreate() {
    // Target the topmost modal's Cancel button
    await this.page.locator('button:has-text("Cancel")').first().click();
    await this.page.waitForTimeout(300);
  }

  // ── Close Cycle ───────────────────────────────────────────────────────────────

  /** Clicks the "Close Cycle" action button on the first OPEN row and waits for confirm dialog */
  async clickCloseCycleAction() {
    await this.page.locator('button:has-text("Close Cycle")').first().click();
    // Wait for the "Yes, Close" confirm button (avoids ambiguous title text selectors)
    await this.page.locator('button:has-text("Yes, Close")').waitFor({ state: 'visible', timeout: 8_000 });
    await this.page.waitForTimeout(300);
  }

  /** Confirms "Yes, Close" on the Close Cycle confirmation */
  async confirmCloseCycle() {
    await this.page.locator('button:has-text("Yes, Close")').first().click();
    await this.page.waitForTimeout(600);
  }

  /** Cancels the Close Cycle confirmation */
  async cancelCloseCycle() {
    await this.page.locator('button:has-text("Cancel")').first().click();
    await this.page.waitForTimeout(300);
  }

  // ── Toast / Notification ──────────────────────────────────────────────────────

  /**
   * Returns the text of the first visible toast/notification.
   * Tries Ant Design message (.ant-message) and notification (.ant-notification).
   */
  async getToastMessage(timeout = 8_000) {
    const toast = this.page.locator(
      '.ant-message-notice-content, .ant-notification-notice-message, .ant-message-success span, .ant-message-error span'
    ).first();
    await toast.waitFor({ state: 'visible', timeout });
    return (await toast.textContent())?.trim() ?? '';
  }

  /** Returns true if an error toast is visible (does not wait) */
  async isErrorToastVisible() {
    return await this.page.locator('.ant-message-error, .ant-notification-error').first().isVisible().catch(() => false);
  }
}

module.exports = { JBPManagementPage };
