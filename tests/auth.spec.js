const { test, expect } = require('@playwright/test');

test('User Journey: Register a new account, check profile, and sign out', async ({ page }) => {
  const uniqueEmail = `e2e_user_${Date.now()}@example.com`;
  const password = 'Password123!';

  // 1. Visit the home page
  await page.goto('http://localhost:5173/');

  // 2. Click on the User Account button in the navbar to open the AuthModal
  const userAccountButton = page.locator('button[aria-label="User Account"]');
  await expect(userAccountButton).toBeVisible();
  await userAccountButton.click();

  // 3. Switch tab to "Create Account"
  const createAccountTab = page.locator('button:has-text("Create Account")');
  await expect(createAccountTab).toBeVisible();
  await createAccountTab.click();

  // 4. Fill in the registration form
  await page.fill('input#auth-email', uniqueEmail);
  await page.fill('input#auth-password', password);
  await page.fill('input#auth-confirm-password', password);

  // 5. Submit the registration form
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
  await submitButton.click();

  // 6. Verify that registration succeeded by clicking the user account button again
  // (The modal closes automatically on success, so we click the user icon to open the user dropdown)
  await expect(userAccountButton).toBeVisible();
  await userAccountButton.click();

  // 7. Check if the user dropdown displays the correct registered email
  const signedInAsLabel = page.locator('span:has-text("Signed in as")');
  await expect(signedInAsLabel).toBeVisible();
  
  const userEmailLabel = page.locator(`span:has-text("${uniqueEmail}")`);
  await expect(userEmailLabel).toBeVisible();

  // 8. Sign out of the account
  const signOutButton = page.locator('button:has-text("Sign Out")');
  await expect(signOutButton).toBeVisible();
  await signOutButton.click();

  // 9. Click the user icon again to confirm we are logged out (modal opens instead of dropdown)
  await userAccountButton.click();
  const signInHeading = page.locator('button:has-text("Sign In")').first();
  await expect(signInHeading).toBeVisible();
});
