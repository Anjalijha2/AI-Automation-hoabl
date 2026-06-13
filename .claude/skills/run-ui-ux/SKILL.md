---
name: run-ui-ux
description: Assert component rendering, responsiveness, accessibility, error/empty states for a portal/module.
---

# Skill: run-ui-ux

**Called by**: QA Agent
**Inputs**: portal name, module name, design spec references from BRD/FRD
**Outputs**: UI assertion results, ARIA/keyboard navigation report, responsive breakpoint report

---

## Command

```bash
npm run test:ui:<portal>
# or:
npx playwright test tests/ui-ux/<portal>/<module>.spec.js --config automation-repository/playwright.config.js --project=ui-ux --workers=1
```

---

## Coverage Requirements

### Component Rendering
- [ ] All documented UI elements visible at page load
- [ ] Correct labels, placeholder text, and button labels per BRD/FRD
- [ ] Loading states and skeleton screens render correctly
- [ ] Toast/notification messages appear and disappear correctly

### Form Validations
- [ ] Required field validation triggers on submit
- [ ] Field-level inline validation messages match FRD specs
- [ ] Error messages use correct text from FRD
- [ ] Success messages/states render correctly

### Empty States
- [ ] Empty list/table shows documented empty state message
- [ ] Empty search results render documented "no results" state

### Accessibility
- [ ] All interactive elements have ARIA roles
- [ ] Form inputs have associated labels
- [ ] Keyboard navigation: Tab order is logical
- [ ] Focus management: modals trap focus, focus returns on close
- [ ] Buttons/links have accessible names

### Responsiveness
- [ ] 1920×900 (desktop — primary)
- [ ] 1440×900 (standard laptop)
- [ ] 768×1024 (tablet — if portal supports it per BRD/FRD)

---

## Constraints

- Test only UI/UX behaviours documented in BRD/FRD
- Do not test business logic here (that's run-e2e territory)
- Accessibility scope: WCAG AA for elements that BRD/FRD explicitly specifies
