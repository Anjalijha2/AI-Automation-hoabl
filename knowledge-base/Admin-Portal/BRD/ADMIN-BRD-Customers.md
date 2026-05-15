# Admin Portal — Customers Module BRD

**Module:** Customers
**URL:** `https://uat-web.xrportal.in/admin/customers`
**Created:** 2026-05-11
**Status:** Complete — Automated (Sprint 2)

---

## 1. Purpose

The Customers module is the main operational dashboard for the admin team. It shows every buyer registration in the system with live statistics, and provides the tools to manage individual customer records — cancelling registrations, approving home loans, and downloading data for reporting.

This is the first page the admin sees after logging in.

---

## 2. Who Uses This

| User | What They Do Here |
|------|------------------|
| Admin | Monitor all registrations, cancel registrations, approve home loans, download data |
| Sales Manager Admin | Same as Admin |

---

## 3. How to Access

This page opens automatically after login. It can also be reached from the left sidebar by clicking **Customers**, or directly at `/admin/customers`.

---

## 4. Screen Layout

### KPI Cards (Top Row — 6 Cards)

Six summary numbers displayed at the top of the page:

| Card | What It Shows | Definition |
|------|--------------|-----------|
| **Registered** | 8,673 (live) | Count of all active registrations (includes Booked Offline, Booked Online, Registered, and Inactive statuses) |
| **Inactive Registrations** | 5 (live) | Registrations set to inactive |
| **Cancelled Registrations** | 999 (live) | Registrations that have been cancelled |
| **KYC Pending (Booked)** | 94 (live) | Buyers who have paid and booked a unit but not yet completed KYC |
| **Confirmed (Paid + KYC)** | 84 (live) | Buyers who have both paid and completed KYC |
| **Active Towers** | 17 (live) | Number of towers currently set to Active in Config |

All numbers update in real time as the underlying data changes.

### Registration Table

Below the KPI cards, a table shows all registrations. A heading above the table shows the total count: "9,672 Registration Records."

**Table columns:**

| Column | What It Shows |
|--------|--------------|
| Registration Details | Registration number (e.g. GHNG-2000000034-F) and date created |
| Growth Partner | The channel partner (broker) who registered this buyer |
| Phone | Buyer's phone number |
| Home Loan Details | Home loan reference number and discount notice if applicable |
| Confirmation Number | Booking confirmation reference (filled after payment) |
| Allotted Unit | Unit number if a unit has been assigned (e.g. "2404-Crown") |
| Allocation Status | Current status: Registered / Booked Online / Booked Offline / Waitlisted / Cancelled |
| Confirmation | Payment confirmation status: Paid or blank |
| Process Status | KYC stage: KYC Pending / KYC Completed |
| Actions | Delete (cancel) button and three-dot menu for other actions |

### Filters and Controls (Above the Table)

| Control | What It Does |
|---------|-------------|
| **Cancel Bulk Units** button | Cancel multiple registrations at once |
| **Filter** button | Open filter options for the table |
| **Refresh** button | Reload table data from the server |
| **Download** button | Export all registrations as an Excel file |
| **Search by Phone** field | Filter table by customer phone number |

### Pagination (Bottom of Table)

- Shows "1–10 of 9,672 items"
- Page size options: 10, 20, 50, or 100 records per page
- Previous/Next page navigation buttons
- Direct page number navigation

---

## 5. Feature Walkthrough

### Viewing the Dashboard on Login

1. After logging in, the Customers page opens automatically
2. KPI cards show the current live counts at the top
3. The table below lists the most recently created registrations first

### Searching for a Specific Customer

1. In the **Search by Phone** field (top right of table), type the customer's phone number
2. The table filters to show matching registrations
3. Clear the field to see all records again

### Filtering Registrations

1. Click the **Filter** button above the table
2. Select filter criteria:
   - **Allocation Status**: Registered / Booked / Inactive / Cancelled
   - **Home Loan Details**: filter by home loan status
   - **Confirmation**: filter by payment confirmation
   - **Process Status**: KYC Pending / KYC Completed
3. Click **OK** to apply
4. The table updates to show only matching records
5. Click **Reset Filters** to clear all filters and show everything again

### Changing Records Per Page

1. Scroll to the bottom of the table to find the pagination bar
2. Click the page size dropdown (shows "10 / page" by default)
3. Select 10, 20, 50, or 100
4. Use the numbered page buttons or Next/Previous arrows to move between pages

### Cancelling a Registration

This action is permanent and cannot be reversed. Use only for test records or confirmed cancellations.

1. Find the registration row in the table
2. Click the **delete (trash)** icon in the Actions column
3. A confirmation popup appears showing:
   - The unit details
   - The refund amount (₹999)
4. Click the red **Cancel Registration** button to confirm
5. A success message ("refunded successfully") appears
6. The registration status changes to Cancelled

### Approving a Home Loan

1. Find the customer's registration row
2. Click the **three-dot (…)** menu in the Actions column
3. Select **Home Loan Approval** from the dropdown
4. A modal opens with a toggle switch
5. Enable the toggle to mark the home loan as approved
6. Save the change

### Downloading All Registration Data

1. Click the **Download** button (top right area)
2. A file named `RegistrationData.xlsx` downloads automatically
3. The file contains all registration records (all 9,672+) with 17 columns of data

Note: The export always downloads all records, regardless of any active filters.

### Refreshing the Table

1. Click **Refresh** to reload data from the server without navigating away

---

## 6. Business Rules

1. The **Registered** KPI card counts four different status values together: Booked Offline + Booked Online + Registered + Inactive — it is NOT just the "Registered" status alone
2. The **Active Towers** KPI reflects the live tower configuration in the Config module — if an admin changes tower status in Config, this number updates automatically
3. Cancelling a registration is permanent and irreversible — always confirm before proceeding
4. The registration table heading (e.g. "9,672 Registration Records") shows the true total count — this is what should be checked, not counting visible rows
5. The Download button exports all records regardless of active filters
6. Each registration can have multiple sub-registrations (e.g. GHNG-2000000034-A, -B, -C) — these represent different unit preferences for the same buyer
7. The Cancel Bulk Units button can cancel multiple sub-registrations at once for bulk operations

---

## 7. Validations

| Action | Validation |
|--------|-----------|
| Cancel Registration | Confirmation popup must be dismissed (cannot be bypassed) |
| Home Loan Approval | Toggle must be explicitly enabled; modal must be submitted |
| Download | No filter validation — always exports everything |

---

## 8. Dependencies

| Module | Relationship |
|--------|-------------|
| [Config / CMS](BRD-Config-CMS.md) | Active Towers KPI pulls from tower configuration in Config |
| [Allocation](BRD-Allocation.md) | Allocation status and allotted unit data originates from allocation campaigns |
| [Sales Managers](BRD-Sales-Managers.md) | SM assignment to buyers is shown in buyer records |
| [Channel Partners](BRD-Channel-Partners.md) | Growth Partner (broker HV code) is shown in the registrations table |
| [Payment Transactions](BRD-Payment-Transactions.md) | Payment confirmation data feeds into the Confirmation column |

---

## 9. User Journey Map

**Standard daily use:**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Opens admin portal | Customers page loads with live KPI cards | Step 2 |
| 2 | Admin | Reviews KPI cards | Sees current counts for Registered, Booked, KYC status, Active Towers | Step 3 |
| 3 | Admin | Searches for a customer by phone | Table filters to matching records | Step 4 |
| 4 | Admin | Clicks three-dot menu on a row | Action options appear | Step 5 |
| 5 | Admin | Selects Home Loan Approval | Modal opens with toggle | Step 6 |
| 6 | Admin | Enables toggle, saves | Home loan approved; row updates | Done |

**Cancellation flow:**

| Step | Actor | Action | System Response | Next Step |
|------|-------|--------|----------------|-----------|
| 1 | Admin | Finds registration to cancel | Row located in table | Step 2 |
| 2 | Admin | Clicks trash icon | Confirmation popup with unit + ₹999 refund | Step 3 |
| 3 | Admin | Clicks red Cancel Registration button | Registration cancelled; "refunded successfully" toast | Done |

---

## 10. Open Questions / Gaps

None. All customer module behavior confirmed through automated testing (17 tests passing as of Sprint 2).

**Note:** The live portal shows 9,672 registration records as of 2026-05-11. This is a live count from UAT data — the number will change as new registrations are created.
