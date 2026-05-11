# Admin Portal — Overview BRD

**Portal:** Admin Portal
**URL:** `https://uat-web.xrportal.in/admin`
**Created:** 2026-05-11
**Status:** Complete

---

## 1. Purpose

The Admin Portal is the central control center for the XR Portal platform. The internal operations team uses it to manage every aspect of the property sales cycle — from activating towers and creating allocation campaigns, to tracking customer bookings, reviewing payments, and managing the sales force.

Everything buyers and channel partners experience is configured, monitored, and controlled through this portal.

---

## 2. Who Uses This

| Role | Description | Access Level |
|------|-------------|-------------|
| Admin | Full platform administrator | All modules, all actions |
| Sales Manager Admin | Elevated sales manager with admin privileges | All modules except some config |

Buyers, channel partners, and standard sales managers cannot access this portal.

---

## 3. How to Access

Navigate to `https://uat-web.xrportal.in/admin` and log in with your registered mobile number and OTP. After successful login, you are taken to the **Customers** page automatically.

---

## 4. Screen Layout — Left Sidebar Navigation

The admin portal has a persistent left sidebar with links to all modules:

| Sidebar Item | URL | Module |
|-------------|-----|--------|
| Customers | `/admin/customers` | Customer registration dashboard |
| Config | `/admin/cms` | System configuration (9 sections) |
| Allocation | `/admin/allocation` | Allocation campaign management |
| Offers | `/admin/offers` | Discount offer management |
| Towers | `/admin/towers` | Tower and unit inventory view |
| JBP Mgmt | `/admin/jbp-management` | Channel partner JBP cycles |
| Channel Partners | `/admin/channel-partners` | CP account management |
| Sales Managers | `/admin/sales-managers` | SM account management |
| Transactions | `/admin/payment-transactions` | Payment ledger |
| CMS | (external link) | Content management (separate system, out of scope) |
| Logout | — | End session |

---

## 5. Feature Walkthrough

### Post-Login Home

After logging in, the admin sees the Customers page — the main operational dashboard showing all registrations and key statistics.

### Navigating to Any Module

Click any item in the left sidebar to navigate directly. The sidebar is always visible — you never need to go "back" to a home screen.

### Logging Out

Click **Logout** at the bottom of the sidebar. The session ends immediately and you are returned to the login screen.

---

## 6. Business Rules

1. Only users with Admin (role ID 1) or Sales Manager Admin (role ID 4) can access any page under `/admin`
2. Attempting to visit any `/admin` URL without a valid session redirects to the login page
3. Sessions expire after 1 day — logging in again refreshes the session
4. The sidebar is always visible on all admin pages — there is no full-screen mode
5. The external "CMS" sidebar link opens a separate content management system at a different domain — it is not part of the admin portal

---

## 7. Validations

- Unauthenticated access to any `/admin/*` page: immediate redirect to login
- Expired session: redirect to login on next page load or action

---

## 8. Dependencies

| Dependency | Why |
|-----------|-----|
| [Login](BRD-Login.md) | Authentication required before any module is accessible |
| All modules | The sidebar links to all modules listed below |

---

## 9. User Journey Map

| Step | Actor | Action | System Response |
|------|-------|--------|----------------|
| 1 | Admin | Opens browser, navigates to `/admin` | Login page shown |
| 2 | Admin | Enters mobile number, receives OTP | OTP entry screen shown |
| 3 | Admin | Enters OTP, clicks Submit | Session created, redirected to Customers page |
| 4 | Admin | Clicks any sidebar item | That module loads |
| 5 | Admin | Completes work, clicks Logout | Session ended, redirected to login |

---

## 10. Open Questions / Gaps

None — all admin portal access control questions resolved as of 2026-05-10.
