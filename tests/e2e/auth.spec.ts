import { test } from '@playwright/test';
import { AuthPage } from '../../src/pages/AuthPage';
import { createUserData } from '../../src/utils/testData';

test.describe('E2E Authentication Flows', () => {
  test('User can register and sign in through UI', async ({ page }) => {
    const authPage = new AuthPage(page);
    const user = createUserData();

    // Sign up
    await authPage.navigateToRegister();
    await authPage.register(user.username, user.email, user.password);
    await authPage.verifyLoggedIn(user.username);

    // Sign out by clearing storage
    await page.evaluate(() => localStorage.clear());

    // Sign in
    await authPage.navigateToLogin();
    await authPage.login(user.email, user.password);
    await authPage.verifyLoggedIn(user.username);
  });
});