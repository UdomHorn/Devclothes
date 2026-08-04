const { test, expect } = require('@playwright/test');

test('User Journey: Add product to bag and visit checkout', async ({ page }) => {
  // 1. Visit the home page
  await page.goto('http://localhost:5173/');

  // 2. Click the first product highlight card link to open details
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();

  // 3. We are now on the Product Detail page. Select any available (non-disabled) Size button
  const sizeButton = page.locator('button:not([disabled])')
    .filter({ hasText: /^(S|M|L|XL|XS)$/ })
    .first();
  await expect(sizeButton).toBeVisible();
  await sizeButton.click();

  // 4. Select the first available color button inside the colors grid
  const colorButton = page.locator('div:has-text("available")').locator('button').first();
  if (await colorButton.isVisible()) {
    await colorButton.click();
  }

  // 5. Click "Add to bag" (using the exact lowercase text from your ProductDetail.jsx)
  const addToBagButton = page.locator('button').filter({ hasText: /^Add to bag$/i }).first();
  await expect(addToBagButton).toBeVisible();
  await addToBagButton.click();

  // 6. Click the shopping bag icon in the navbar (using aria-label="Cart" from Nav.jsx)
  const cartIcon = page.locator('a[aria-label="Cart"]');
  await expect(cartIcon).toBeVisible();
  await cartIcon.click();

  // 7. Verify we successfully redirected to the checkout page
  await expect(page).toHaveURL(/.*checkout/);

  // 8. Fill in the Billing & Shipping form using the exact field IDs from your Checkout.jsx
  await page.fill('input#fullname', 'John Doe');
  await page.fill('input#email', 'john.doe@example.com');
  await page.fill('input#phone', '099888777');
  
  // Fill shipping fields (if shipping method is selected)
  if (await page.locator('input#street').isVisible()) {
    await page.fill('input#street', '123 Russian Blvd');
    await page.fill('input#district', 'Tuol Kouk');
    await page.fill('input#province', 'Phnom Penh');
    await page.fill('input#zip', '12000');
  }

  // 9. Confirm the checkout review bag header displays correctly
  const reviewBag = page.locator('h2:has-text("Review Your Bag")');
  await expect(reviewBag).toBeVisible();
});
