---
paths:
  - "src/pages/**/*.js"
  - "src/base/**/*.js"
---

# Page Object Rules

Every page object must extend `BasePage` from `src/base/BasePage.js`.

```javascript
const { BasePage } = require('../base/BasePage');
const selectors = require('../../docs/selectors/<module>.json');

class <Module>Page extends BasePage {
  constructor(page) {
    super(page);
    this.s = selectors.selectors;
  }
}
module.exports = { <Module>Page };
```

- Selectors always from `docs/selectors/<module>.json` — never hardcoded
- Methods are atomic — one logical action per method
- File name: `<Module>Page.js` (PascalCase + "Page" suffix)
- Export named: `module.exports = { <Module>Page }`
