# CP Portal — User Manual Index

**Portal:** Channel Partner (Growth Partner) Portal
**Base URL:** `https://uat-web.xrportal.in/`
**Audience:** Channel Partner / Sales Agent (Role ID 3 — includes Lead/Master CPs and Member CPs)
**Auth:** Mobile OTP — no password (UAT static: mobile `8888888888`, OTP `147258`)
**Last Updated:** 2026-05-22
**Source Base Path:** `.claude/docs/hoabl-knowledge-base/CP-Portal/`

---

## Overview

The CP Portal is the workspace for Channel Partners (Growth Partners) who refer buyers, register customers, manage their LSQ leads, assist with post-allocation KYC, submit their Joint Business Plans, and access the project marketing kit. This index links every module-level user manual for the CP Portal.

CPs see only their own data — every screen enforces `brokerId` / assignee filtering (CP isolation, BRD §4.1).

---

## Module User Manuals

| # | Module | URL | Manual | Purpose |
|---|--------|-----|--------|---------|
| 1 | Login | `/login` | [login.md](./login.md) | Mobile-OTP login; first-time profile completion redirect |
| 2 | Leads Management | `/leads` | [leads-management.md](./leads-management.md) | View LSQ-assigned leads; convert lead → Customer Registration |
| 3 | Customer Registration | `/dashboard` | [customer-registration.md](./customer-registration.md) | View own customer dashboard; register a new buyer; track allocation/KYC/payment status |
| 4 | KYC Assistance | `/kyc` | [kyc-assistance.md](./kyc-assistance.md) | Complete post-allocation KYC for WINNER customers; upload 4 docs per applicant; up to 4 applicants |
| 5 | JBP Submission | `/jbp`, `/jbp/thank-you` | [jbp-submission.md](./jbp-submission.md) | Submit Joint Business Plan during OPEN cycle; submit edit requests |
| 6 | Project Information | `/project`, `/project1/*` | [project-information.md](./project-information.md) | Read-only marketing kit — about, gallery, amenities, documents (RERA), key points, videos |

---

## Source Documents

| Module | BRD | FRD |
|--------|-----|-----|
| Portal-wide | `CP-BRD-CP-Portal.md` | — |
| Login | — | `CP-FS-Login.md` |
| Leads Management | — | `CP-FS-Leads-Management.md` |
| Customer Registration | — | `CP-FS-Customer-Registration.md` |
| KYC Assistance | — | `CP-FS-KYC-Assistance.md` |
| JBP Submission | — | `CP-FS-JBP-Submission.md` |
| Project Information | — | `CP-FS-Project-Information.md` |

All source files live under `.claude/docs/hoabl-knowledge-base/CP-Portal/`.

---

## Cross-Module Business Rules (BRD §4)

1. **CP isolation** — CPs see only their own customers and leads (`brokerId` / LSQ assignee filter).
2. **Duplicate prevention** — Registration rejected if mobile or email already on a registration for this project.
3. **T&C mandatory** — Customer Undertaking checkbox is required and is legal proof.
4. **Registration number format** — `GHNG-XXXXXXXXXX` (10 digits); additional units `-A`, `-B`, `-C`.
5. **JBP — one per cycle** — One active JBP per CP per cycle; post-submission edits via admin-reviewed Edit Request only.
6. **JBP cycle gating** — Submissions accepted only while cycle is OPEN.
7. **JBP versioning** — Approved edits increment the version; old version marked EXPIRED.
8. **KYC is post-allocation only** — Available only after customer reaches WINNER status.
9. **All 4 KYC documents mandatory per applicant** — Photo, PAN, Aadhaar front, Aadhaar back.
10. **Project content is read-only** — All content managed by admin via Strapi CMS.

---

## Roles

| Role | Role ID | Notes |
|------|---------|-------|
| Channel Partner | 3 | Standard CP |
| Lead / Master CP | 3 + `isLeadCp = true` | Manages Member CPs |
| Member CP | 3 + `leadCpId` set | Linked to a Master CP |

---

## Integrations Touched by CP Portal

| Integration | Purpose |
|-------------|---------|
| LeadSquared (LSQ) | Lead sync (read), KYC document upload |
| Azure Blob Storage | KYC document storage; KYC PDF storage |
| Kaleyra | SMS / WhatsApp customer notifications |
| Strapi CMS | Project Information content source |

---

## Related Repositories

- **Test cases:** `manual-qa-repository/01-test-cases/cp-portal/` — per-module `TC_*.md` files
- **Bug tracker:** `manual-qa-repository/04-bug-reports/BUG_TRACKER.md`
- **Execution summaries:** `manual-qa-repository/06-test-runs/`
- **Automation specs:** `tests/<type>/cp-portal/<module>.spec.js`
- **POMs:** `automation-repository/pages/cp-portal/<Module>Page.js`
- **Locator map:** `locators/cp-portal/locator-map.json`
