/**
 * SELECTOR HELPER — Loads selector JSON files from manual-qa-repository/selectors/
 * Keeps automation scripts in sync with the single source of truth.
 */

const fs = require('fs');
const path = require('path');

function loadSelectors(module) {
  const filePath = path.join(process.cwd(), 'manual-qa-repository', 'selectors', `${module.toLowerCase()}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Selector file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = { loadSelectors };
