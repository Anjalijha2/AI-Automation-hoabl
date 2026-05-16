// automation-repository/utils/WaitUtil.js
// Reusable polling / timing helpers.

class WaitUtil {
  /**
   * Poll a condition function until it returns true or timeout is reached.
   * @param {() => Promise<boolean>} condition
   * @param {{ timeout?: number, interval?: number, message?: string }} opts
   */
  static async pollUntil(condition, { timeout = 10_000, interval = 500, message = 'Condition not met' } = {}) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await condition()) return;
      await WaitUtil.sleep(interval);
    }
    throw new Error(`Timeout: ${message}`);
  }

  static sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  /**
   * Retry an async action up to `retries` times.
   */
  static async retry(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        await WaitUtil.sleep(delay);
      }
    }
  }
}

module.exports = { WaitUtil };
