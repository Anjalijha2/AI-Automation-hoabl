/**
 * SELECTOR HELPER — Loads selector JSON files from docs/selectors/
 * Keeps automation scripts in sync with the single source of truth.
 */
import * as fs from 'fs';
import * as path from 'path';

type SelectorMap = Record<string, string>;

export function loadSelectors(module: string): SelectorMap {
  const filePath = path.join(process.cwd(), 'docs', 'selectors', `${module.toLowerCase()}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Selector file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
