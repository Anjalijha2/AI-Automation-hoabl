# Feature-Spec: Leads Management

**Portal:** Channel Partner Portal
**URL:** `https://uat.xrportal.in/leads`
**Created:** 2026-05-12
**Status:** Complete

---

## Feature 1: View and Manage Leads

### 1.1 Objective

Allow CPs to view leads assigned to them from LeadSquared CRM, track follow-up activity, and convert high-quality leads into formal customer registrations.

### 1.2 Scope

Leads are synced from the LeadSquared (LSQ) CRM platform. CPs see only their own leads.

### 1.3 Preconditions

- CP must be logged in
- Leads must be assigned to the CP in LeadSquared

### 1.4 Lead Information Displayed

| Column | Description |
|--------|-------------|
| Lead Name | Prospect's name |
| Contact Details | Phone and email |
| Lead Source | How the lead was generated |
| Status / Stage | Current stage in the LeadSquared pipeline |
| Last Activity | Most recent interaction recorded |

### 1.5 Business Rules

1. Lead data is synced from LeadSquared CRM — the CP Portal displays, not manages, leads
2. CPs see only leads assigned to them (filtered by assignee in LSQ)
3. CPs can convert a qualifying lead into a formal registration directly from this screen

### 1.6 System Actions

1. Lead list is fetched from the backend which syncs with LeadSquared
2. On lead-to-registration conversion, a new Registration record is created and the customer is linked to the CP's broker account

---

## How to Use: Managing Your Leads

**Who does this:** Channel Partner

---

**Step 1 — Navigate to Leads**

From the navigation menu, click **Leads**. Your assigned leads will load from the system.

**Step 2 — Review your leads**

Each row shows the lead's name, contact details, where they came from, and what stage they are at in the sales pipeline.

**Step 3 — Convert a lead to a registration**

When a lead is ready to formally register, click the convert option on their row. You will be taken to the registration form with their details pre-filled. Complete the form and submit to create a formal registration record.

> **Note:** Lead data comes from LeadSquared. If a lead is not appearing here, check with your manager — it may not yet be assigned to you in the CRM.
