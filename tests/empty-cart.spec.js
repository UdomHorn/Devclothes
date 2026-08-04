const { test, expect } = require('@playwright/test');

test('User Journey: Access checkout directly with empty cart and redirect to home', async ({ page }) => {
  // 1. Navigate directly to the checkout page
  await page.goto('http://localhost:5173/checkout');

  // 2. Expect the empty bag message to display
  const emptyHeading = page.locator('h2:has-text("Your Shopping Bag is Empty")');
  await expect(emptyHeading).toBeVisible();

  const emptyText = page.locator('p:has-text("Add items from the store to make a payment.")');
  await expect(emptyText).toBeVisible();

  // 3. Click the "Browse Products" button to return to the store catalogue
  const browseButton = page.locator('a:has-text("Browse Products")');
  await expect(browseButton).toBeVisible();
  await browseButton.click();

  // 4. Verify we are successfully redirected back to the home page
  await expect(page).toHaveURL('http://localhost:5173/');
});
