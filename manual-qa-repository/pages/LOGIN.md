# LOGIN PAGE

## Description
Entry point of the XR Portal Admin application.
Uses a 2-step Mobile OTP authentication flow (no password).

## URL
https://uat-web.xrportal.in/admin

## Element Selectors

| Element            | Selector                                           |
|--------------------|----------------------------------------------------|
| Mobile Input       | `input[placeholder="Enter Mobile Number"]`         |
| Send OTP Button    | `button:has-text("Send OTP")`                      |
| OTP Box 1          | `input[aria-label="OTP Input 1"]`                  |
| OTP Box 2          | `input[aria-label="OTP Input 2"]`                  |
| OTP Box 3          | `input[aria-label="OTP Input 3"]`                  |
| OTP Box 4          | `input[aria-label="OTP Input 4"]`                  |
| OTP Box 5          | `input[aria-label="OTP Input 5"]`                  |
| OTP Box 6          | `input[aria-label="OTP Input 6"]`                  |
| Submit OTP Button  | `button:has-text("Submit OTP")`                    |
| Re-Send OTP        | `text=Re-Send OTP`                                 |
| Back Button        | `button.reset-btn.back-to-mobile`                  |
| OTP Timer          | `text=/\d+s/`                                      |

## Workflow Steps

1. Navigate to https://uat-web.xrportal.in/admin
2. Enter mobile number in the mobile input field
3. Click "Send OTP" button
4. Wait for OTP screen to appear (OTP Input 1 visible)
5. Enter 6-digit OTP across individual input boxes
6. Click "Submit OTP"
7. Verify redirect to /admin/customers

## Page Object File
`automation/pages/login.page.ts`

## Automation Test File
`automation/tests/login.spec.ts`

## Execution Commands

```bash
# Run all login tests
npx playwright test login.spec.ts --headed --workers=1

# Run only positive
npx playwright test login.spec.ts -g "POSITIVE" --headed --workers=1

# Run only negative
npx playwright test login.spec.ts -g "NEGATIVE" --headed --workers=1
```

## Known Behaviors

- OTP boxes auto-advance focus between digits
- Timer counts down (e.g. "55s") before Resend OTP becomes clickable
- Mobile field is numeric-only (letters and special characters are blocked)
- Back button returns to mobile entry screen