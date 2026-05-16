# Changelog

## 2026-05-16

- Repository restructured to sprint-wise, portal-wise execution model
- All previous manual test cases, automation scripts, and sprint artifacts removed
- New structure: `sprints/<sprint-N>/<portal>/` for all QA artifacts
- Automation repository restructured with template-based layout (BasePage, LoginPage, ApiClient, WaitUtil, base-test fixtures)
- `tests/ui/` renamed to `tests/e2e/`; added `tests/visual/`
- `playwright.config.js` updated for new directory structure
- `package.json` cleaned up — removed stale module-specific scripts
