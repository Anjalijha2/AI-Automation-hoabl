# XR Portal Admin — User Manual

**Version:** 1.0  
**Environment:** UAT (`https://uat-web.xrportal.in/admin`)  
**Auth:** Mobile OTP (no password)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Login](#login)
3. [Dashboard](#dashboard)
4. [Customers](#customers)
5. [Towers](#towers)
6. [Allocation](#allocation)
7. [Channel Partners](#channel-partners)
8. [JBP Management](#jbp-management)
9. [Offers](#offers)
10. [Config / CMS](#config--cms)

---

## Getting Started

XR Portal Admin is the back-office portal for managing real estate operations — customers, unit allocations, towers, channel partners, and business plans.

**Access:** `https://uat-web.xrportal.in/admin`  
**Auth method:** 2-step Mobile OTP — no password required

---

## Login

See [pages/LOGIN.md](pages/LOGIN.md) for full screen documentation.

**Steps:**
1. Open portal URL
2. Enter registered admin mobile number
3. Click **Send OTP**
4. Enter OTP received on mobile
5. Click **Login** / **Verify**
6. Portal opens on Customers module

**UAT Credentials:** Mobile `8888888888` · OTP `258369` (static)

---

## Dashboard

Post-login landing page. Shows summary widgets:
- Total customers
- Active allocations
- Available units
- Pending actions

Navigation sidebar gives access to all modules.

---

## Customers

Full documentation: [pages/CUSTOMERS.md](pages/CUSTOMERS.md) _(to be created)_

- View all customers in a searchable, filterable table
- Click customer row → detail view
- Manage documents, booking status, communication history

---

## Towers

Full documentation: [pages/TOWERS.md](pages/TOWERS.md) _(to be created)_

- View all towers/projects
- See unit availability matrix
- Manage floor plans, unit types, pricing

---

## Allocation

Full documentation: [pages/ALLOCATION.md](pages/ALLOCATION.md) _(to be created)_

- Assign units to customers
- Track allocation status lifecycle
- Manage payment milestones

---

## Channel Partners

Full documentation: [pages/CHANNEL-PARTNERS.md](pages/CHANNEL-PARTNERS.md) _(to be created)_

- Manage external channel partner accounts
- Configure commission structures
- Track partner performance

---

## JBP Management

Full documentation: [pages/JBP.md](pages/JBP.md) _(to be created)_

- Set joint business plan targets with partners
- Track actuals vs. targets
- Approve/reject JBP proposals

---

## Offers

Full documentation: [pages/OFFERS.md](pages/OFFERS.md) _(to be created)_

- Create and manage promotional offers
- Apply offers to specific units or customer segments
- Track offer utilization

---

## Config / CMS

Full documentation: [pages/CONFIG.md](pages/CONFIG.md) _(to be created)_

- Manage system-wide configurations
- Publish/edit CMS content (banners, pages)
- Control feature toggles
