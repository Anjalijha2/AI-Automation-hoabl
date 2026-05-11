---
name: Ant Design Drawer vs Modal in XR Portal
description: Some XR Portal modules use Ant Design Drawer (.ant-drawer-body) not Modal (.ant-modal-body) for forms
type: feedback
---

Not all XR Portal form dialogs are centered modals. The Offers module uses Ant Design **Drawer** (`.ant-drawer-body`), which slides in from the right side of the screen.

**Drawer selectors:** `.ant-drawer-body`, `.ant-drawer-title`, `.ant-drawer-close`
**Modal selectors:** `.ant-modal-body`, `.ant-modal-title`, `.ant-modal-close`

**Why:** Initial BRD/snapshot analysis showed `dialog[name="Add New Offer"]` from the accessibility tree, but the DOM class is `ant-drawer-content`. Using `.ant-modal-body` would have found nothing.

**How to apply:** When writing a new POM for a module with a form overlay, always `evaluate()` in the live browser to check whether the class is `.ant-drawer-*` or `.ant-modal-*` before coding. Both share `[role="dialog"]` at the accessibility level but have different CSS class hierarchies.
