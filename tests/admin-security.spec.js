const { test, expect } = require('@playwright/test');

test('User Journey: Access admin portal without credentials and verify access denied redirect', async ({ page }) => {
  // 1. Attempt to navigate directly to the Admin portal upload page
  await page.goto('http://localhost:5173/admin/upload');

  // 2. Expect "Access Denied" message to show since we are not logged in as admin
  const accessDeniedHeading = page.locator('h2:has-text("Access Denied")');
  await expect(accessDeniedHeading).toBeVisible();

  const accessDeniedText = page.locator('p:has-text("You do not have permission to access the Admin Portal")');
  await expect(accessDeniedText).toBeVisible();

  // 3. Click the "Back to Home" button
  const backToHomeButton = page.locator('a:has-text("Back to Home")');
  await expect(backToHomeButton).toBeVisible();
  await backToHomeButton.click();

  // 4. Verify we are safely back on the main shopping store homepage
  await expect(page).toHaveURL('http://localhost:5173/');
});
