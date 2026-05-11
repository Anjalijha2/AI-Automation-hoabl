# Offers — BRD

**Portal:** Admin Portal
**URL:** `https://uat-web.xrportal.in/admin/offers`
**Created:** 2026-05-11
**Status:** Complete

---

## 1. Purpose

The Offers module allows admins to configure discount offers that are automatically applied to buyer pricing during allocation campaigns. Offers reduce the Agreement Value of units, making pricing more attractive during the sales event.

---

## 2. Who Uses This

| Role | Action |
|------|--------|
| Admin | Create, edit, activate, deactivate, and delete offers |
| Buyers (via Customer Portal) | See discounts automatically applied when selecting units |

---

## 3. Offer Types

| Type | How It Works |
|------|-------------|
| **Amount Based** | Fixed INR discount applied to Agreement Value (e.g., ₹27,000 off) |
| **Percentage Based** | Percentage discount applied to Agreement Value (e.g., 5% off) |

---

## 4. System-Generated Offers (Not Admin-Created)

These offers are automatically created by the system — admin does not create them manually:

| Code | Trigger |
|------|---------|
| `HOME_LOAN` | Created when admin approves a buyer's home loan application (in Customers module) |
| `VC_REQUEST` | Created when SM records a video call outcome of VC_DONE_PREFERENCE or VC_2_DONE |

---

## 5. Key Business Rules

1. **Live effect:** Offer activations and deactivations take effect immediately during active allocation campaigns.
2. **No confirmation on toggle:** Toggling an offer OFF has no confirmation dialog — it takes effect instantly.
3. **Typology scope:** Offers can be restricted to specific unit types (1 Bed / 2 Bed variants) or apply to all typologies.
4. **Date validity:** Offers only apply when Start Date ≤ today ≤ End Date.
5. **Pricing formula:** Agreement Value − sum of all active, applicable, valid offers = All Inclusive Price.
6. **Race condition:** If an offer is toggled OFF between a buyer viewing pricing and completing payment, the offer disappears from the final booking amount.
7. **Locked bookings:** Buyers who already completed payment are NOT affected by subsequent offer changes.

---

## 6. Admin Workflow (Step by Step)

1. Go to `/admin/offers`
2. Click "Add New Offer"
3. Fill in: offer name, type (Amount/Percentage), discount value, validity dates, typology (optional)
4. Click "Create Offer" → offer appears with Active status ON by default
5. To deactivate: click the toggle switch in the Action column → offer immediately stops applying
6. To re-activate: click toggle again
7. To delete: click trash icon → confirm in the dialog

---

## 7. Offer Application During Allocation

At the moment a buyer clicks "Proceed to Pay":
- System queries all offers where `isActive = true` AND `startDate ≤ today` AND `endDate ≥ today` AND typology matches
- All qualifying offers are summed and deducted from Agreement Value
- Confirmation Amount is shown to buyer for payment

---

## 8. Critical Risk

> **CRITICAL:** Toggling OFF a high-value offer during a live allocation campaign immediately removes that discount from all active buyer sessions. This can cause buyer confusion and potential pricing disputes. Always coordinate offer changes with your team before touching offer toggles during a live campaign.

---

## 9. Related Documents

- [[Feature-Spec - Offers]] — Full feature specifications with How to Use
- [[Allocation]] — Campaigns where offers are applied
- [[Customers]] — Home Loan Approval triggers HOME_LOAN offer
