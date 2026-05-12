# XR Portal — System Overview

**Document Type:** System Overview
**Project:** XR Portal (HoABL Real Estate Platform)
**Created:** 2026-05-12
**Status:** Complete

> **Full Master-BRD version:** [[Master-BRD/XR-Portal-Overview]]

---

## What Is XR Portal?

XR Portal is a digital real estate sales platform built for House of Abhinandan Lodha (HoABL). It manages the complete journey of selling residential units — from buyer registration through live unit selection, payment, KYC, construction-linked milestone payments, and final possession.

---

## Four Portals, One System

| Portal | URL | Who Uses It |
|--------|-----|------------|
| Admin Portal | `https://uat-web.xrportal.in/admin` | Internal operations team |
| CP Portal | `https://uat-web.xrportal.in` (root) | Channel partners / brokers |
| SM Portal | `https://uat-web.xrportal.in/sales-manager` | Sales managers |
| Buyer Portal | `https://uat.xrportal.in` | Registered buyers |

All portals share one backend database. Actions in one portal immediately reflect in all others.

---

## The Project: Xanadu (GHNG)

| Detail | Value |
|--------|-------|
| Registration code format | GHNG-XXXXXXXXXX |
| Unit types | 1BHK, 2BHK (Growth Home, Rise Home, Peak Home) |
| Allocation types | STATIC, DYNAMIC, PHYSICAL_EVENT |

---

## Buyer Journey (Summary)

1. Buyer registers → pays registration fee → receives GHNG registration number
2. Admin starts allocation campaign → buyer selects/is assigned a unit
3. Payment confirmed via gateway webhook → buyer becomes WINNER
4. Buyer completes KYC (documents + applicant details)
5. Milestone payment schedule generated post-KYC
6. Buyer pays construction-linked instalments
7. Final possession on completion

---

## Key Documents

- [[Master-BRD/XR-Portal-Overview]] — Full system overview
- [[Master-BRD/Admin-Portal/BRD-Admin-Overview]] — Admin Portal
- [[Master-BRD/Buyer-Portal/BRD-Buyer-Portal]] — Buyer Portal
- [[Master-BRD/CP-Portal/BRD-CP-Portal]] — CP Portal
- [[Master-BRD/SM-Portal/BRD-SM-Portal]] — SM Portal
- [[Master-BRD/Business-Rules/BRD-Business-Rules]] — All business rules
- [[Master-BRD/Glossary/BRD-Glossary]] — Term definitions
- [[Business-Flows/BF-001-Allocation-Campaign-Lifecycle]] — End-to-end allocation flow
