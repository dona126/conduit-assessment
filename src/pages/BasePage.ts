import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async injectAuthToken(token: string) {
    await this.page.addInitScript((jwt) => {
      window.localStorage.setItem('jwtToken', jwt);
    }, token);
  }
}