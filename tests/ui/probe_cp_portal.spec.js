const { test } = require('@playwright/test');

test('probe CP portal OTP inputs', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('https://uat-web.xrportal.in', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Enter phone
  const phoneInput = page.locator('input').first();
  console.log('Phone input tag:', await phoneInput.getAttribute('type'));
  await phoneInput.fill('8888888888');
  await page.locator('button:has-text("Send OTP")').first().click();
  await page.waitForTimeout(3000);

  // Dump all inputs on OTP page
  const inputs = await page.locator('input').all();
  console.log(`OTP page — ${inputs.length} input(s) found`);
  for (let i = 0; i < inputs.length; i++) {
    const type = await inputs[i].getAttribute('type').catch(() => '');
    const maxlen = await inputs[i].getAttribute('maxlength').catch(() => '');
    const ph = await inputs[i].getAttribute('placeholder').catch(() => '');
    const cls = await inputs[i].getAttribute('class').catch(() => '');
    console.log(`  Input[${i}]: type=${type} maxlength=${maxlen} placeholder=${ph} class=${cls?.slice(0,60)}`);
  }

  // Check for OTP container
  const otpContainer = await page.locator('[class*="otp"], [class*="OTP"], [id*="otp"]').count();
  console.log('OTP container count:', otpContainer);

  // Full page HTML around OTP area
  const html = await page.locator('form, .otp-container, [class*="otp"]').first().innerHTML().catch(() => 'not found');
  console.log('OTP form HTML:', html.slice(0, 600));
});
