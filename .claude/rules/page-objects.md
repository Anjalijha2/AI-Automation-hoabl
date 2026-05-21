---
paths:
  - "automation-repository/pages/admin/**/*.js"
---

# Page Object Rules

Every page object must extend `BasePage` from `automation-repository/base/BasePage.js`.

```javascript
const { BasePage } = require('../../base/BasePage');
const locatorMap = require('../../../locators/<portal>/locator-map.json');

const L = locatorMap.<module>;

class <Module>Page extends BasePage {
  constructor(page) {
    super(page);
    this.L = L;
  }
}
module.exports = { <Module>Page };
```

- Locators always from `locators/<portal>/locator-map.json` — never hardcoded
- Methods are atomic — one logical action per method
- File name: `<Module>Page.js` (PascalCase + "Page" suffix)
- Export named: `module.exports = { <Module>Page }`
