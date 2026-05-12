# CP Portal Login — BRD

> **Note:** This file is in a legacy folder structure. The current authoritative document is:
> [[Portals/CP-Portal/Feature-Specs/Feature-Spec - Login]]

---

## CP Portal Login (Summary)

**Portal:** CP Portal
**URL:** `https://uat-web.xrportal.in` (root)
**Auth method:** Mobile OTP (no password)

### Login Flow

1. CP enters registered mobile number
2. System sends 6-digit OTP via SMS/WhatsApp (Kaleyra)
3. CP enters OTP (UAT static OTP: `258369`)
4. JWT token issued with role_id = 3 (CP)
5. CP redirected to their dashboard

### Key Rules

- OTP expires after a set window — re-request if expired
- Rate limiter blocks excessive OTP requests per IP
- Unregistered or inactive CPs cannot log in
- Session persists via JWT stored in browser

### Related Documents

- [[Portals/CP-Portal/CP-Portal-BRD]] — Full CP Portal overview
- [[Portals/CP-Portal/Feature-Specs/Feature-Spec - Login]] — Full login feature spec
- [[Master-BRD/CP-Portal/BRD-CP-Portal]] — Master BRD for CP Portal
- [[Master-BRD/Roles-and-Permissions/BRD-Roles-and-Permissions]] — CP role definition
