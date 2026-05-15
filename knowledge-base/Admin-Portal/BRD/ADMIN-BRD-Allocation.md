# Allocation — BRD

**Portal:** Admin Portal
**URL:** `https://uat-web.xrportal.in/admin/allocation`
**Created:** 2026-05-11
**Status:** Complete

---

## 1. Purpose

The Allocation module allows admins to create and manage time-bound campaigns during which registered buyers can select and book units. It is the core event-management tool for the property sales process — no unit can be booked without an allocation campaign (except via admin offline booking in the Customers module).

---

## 2. Who Uses This

| Role | Action |
|------|--------|
| Admin | Create, monitor, stop, and cancel campaigns |
| Sales Manager Admin | Monitor campaigns |
| Buyers (via Customer Portal) | Participate in active campaigns to select and book units |

---

## 3. Campaign Types

| Type | How It Works |
|------|-------------|
| **Static** | All eligible buyers see all available units simultaneously. First to pay gets the unit. |
| **Dynamic** | Round-based. System assigns buyers to rounds. Only buyers in the active round can select units. |
| **Physical Event** | Walk-in on-site event. Admin or SM assigns units to buyers offline. |

---

## 4. Key Business Rules

1. **3-minute lead time:** Campaign Start Time must be at least 3 minutes in the future.
2. **Single active campaign:** Only one campaign should run at a time on UAT.
3. **Tower prerequisite:** At least one tower must be Active in Config CMS before a campaign can be meaningful.
4. **Post-campaign status:** Buyers who didn't complete payment become Waitlisted. Buyers who paid remain Confirmed (Booked).
5. **Stop vs. Cancel:** Stop ends an Active campaign; Cancel removes an Upcoming campaign before it starts.

---

## 5. Campaign Status Flow

```
Upcoming → Active → Completed (auto, at end time)
Upcoming → Cancelled (manual, before start)
Active → Stopped (manual, before end time)
Active → Failed (system error)
```

---

## 6. Admin Workflow (Step by Step)

1. Configure towers in Config CMS → ensure at least one tower is Active
2. Go to `/admin/allocation`
3. Fill in campaign form: name, type (Static/Dynamic/Physical Event), start time (3+ min from now), end time
4. Click "Save Campaign" → status = Upcoming
5. At scheduled start time: campaign automatically goes Active; buyers can participate
6. Monitor campaign: watch the campaign list; check Towers module for real-time unit status
7. When complete: campaign auto-ends at end time (Completed) or admin clicks Stop (Stopped)
8. Review results: check Customers module for newly Booked registrations

---

## 7. Buyer Experience (Customer Portal Side)

- Buyer logs in to Customer Portal during Active campaign
- Sees tower grid with colour-coded unit availability (White = available, Red = sold, Orange = being paid)
- Clicks available unit → sees pricing with offer discounts applied
- Clicks "Proceed to Pay" → Easebuzz payment popup
- Pays confirmation amount → booking locked → unit turns Red

---

## 8. Integrations

| System | Role |
|--------|------|
| Python WebSocket Server | Real-time unit grid updates during active campaign |
| Redis | Campaign state cache and unit hold timers |
| Easebuzz | Online payment gateway for buyer booking confirmation |
| Kaleyra | Notifications to buyers when campaign goes Active or ends |
| Mavis | Unit booking sync after successful payment |
| LeadSquared | Booking activity logged to CRM |

---

## 9. Related Documents

- [[Feature-Spec - Allocation]] — Full feature specifications with How to Use
- [[Config CMS]] — Tower Configuration (prerequisite)
- [[Customers]] — View resulting bookings post-campaign
- [[Realtime-Events-BRD]] — WebSocket event details
