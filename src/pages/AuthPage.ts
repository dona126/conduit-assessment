import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AuthPage extends BasePage {
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async navigateToRegister() {
    await this.page.goto('/register');
  }

  async navigateToLogin() {
    await this.page.goto('/login');
  }

  async register(username: string, email: string, password: string) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async verifyLoggedIn(username: string) {
    await expect(this.page.locator(`a:has-text("${username}")`)).toBeVisible({ timeout: 10_000 });
  }
}