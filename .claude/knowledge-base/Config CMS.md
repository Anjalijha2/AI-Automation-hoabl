# Config CMS — Overview

> **Full documentation:**
> - [[Portals/Admin-Portal/Feature-Specs/Feature-Spec - Config CMS]] — Admin Portal Config CMS feature spec
> - [[Master-BRD/CMS/BRD-CMS]] — Strapi CMS Master BRD

---

## What Is Config CMS?

The Config CMS module in the Admin Portal allows the admin team to manage dynamic configuration — bulk uploads, system settings, and content updates — without code deployments.

### Admin Portal CMS Sub-Modules

| Sub-Module | Purpose |
|-----------|---------|
| Unit Status Upload | Bulk update unit statuses via CSV (AVAILABLE / RESERVED) |
| Registration Status Upload | Bulk update buyer allocation eligibility (Allow / Forbid) |
| SM Bulk Upload | Create or update Sales Managers via XLSX |
| CP Bulk Upload | Create or update Channel Partners via XLSX |
| Bulk Booking Cancellation | Cancel multiple unit bookings via CSV |
| Bulk Registration Cancellation | Cancel multiple registrations via CSV |
| Max Preferences Per Unit | Set the maximum number of buyers who can preference a unit |
| Payment Gateway Settings | Enable / disable Easebuzz and Razorpay |
| Allocation Masking Settings | Toggle SM masking during allocation display |

### Strapi CMS (Separate System)

Strapi is the headless CMS that powers:
- Project gallery, banners, amenities, documents
- Registration and KYC form field definitions
- Allocation page hero slides and header messages
- DYNAMIC allocation band configuration

Content updated in Strapi appears on the portal on the next page load — no deployment needed.

### Related Documents

- [[Portals/Admin-Portal/Feature-Specs/Feature-Spec - Config CMS]] — Full Admin CMS feature spec
- [[Master-BRD/CMS/BRD-CMS]] — Strapi CMS Master BRD
- [[Master-BRD/Integrations/BRD-Integrations]] — Strapi as inbound integration
