const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            storageState: 'automation/fixtures/.auth/admin.json',
            baseURL: 'https://uat-web.xrportal.in/admin'
        });
        const page = await context.newPage();
        await page.goto('/admin/cms');
        await page.waitForLoadState('networkidle');

        const handles = await page.$$("text='Tower 8 - Crest'");
        let output = "";
        for (let i = 0; i < handles.length; i++) {
            const h = handles[i];
            const html = await h.evaluate(el => {
                let parent = el;
                let count = 0;
                while (parent.parentElement && count < 4) {
                    parent = parent.parentElement;
                    count++;
                }
                return parent.outerHTML;
            });
            output += `Element ${i + 1}:\n${html}\n\n`;
        }

        const allCards = await page.$$('.ant-card');
        output += `\nTotal .ant-card elements: ${allCards.length}\n`;

        fs.writeFileSync('dom.txt', output, 'utf8');
        await browser.close();
    } catch (e) {
        fs.writeFileSync('dom.txt', e.toString(), 'utf8');
    }
})();
