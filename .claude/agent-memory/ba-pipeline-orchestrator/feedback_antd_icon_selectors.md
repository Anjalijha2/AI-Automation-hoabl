---
name: Ant Design Icon Button Selectors
description: Ant Design icon buttons use aria-label on anticon spans, NOT img[alt] — critical for all XR Portal modules
type: feedback
---

Ant Design icon buttons in XR Portal use `<span role="img" aria-label="edit" class="anticon anticon-edit">` — NOT `<img alt="edit">` tags.

**Wrong:** `button:has(img[alt="edit"])`
**Correct:** `button:has([aria-label="edit"])`

This applies to ALL Ant Design icon buttons: edit, delete, eye (view), close, filter, search, etc.

**Why:** Discovered in Sprint 4 Offers module when TC-007, TC-008, TC-011 all failed with TimeoutError on `button:has(img[alt="edit"])`. The anticon component renders SVG icons inside a span with aria-label, not img elements.

**How to apply:** In all future page objects, use `button:has([aria-label="<iconName>"])` for Ant Design action icon buttons. When uncertain, inspect with `document.querySelectorAll('button')` and check `.querySelector('[aria-label]')` rather than `.querySelector('img')`.
