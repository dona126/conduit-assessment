import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ArticlePage extends BasePage {
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagsInput: Locator;
  readonly publishButton: Locator;
  readonly articleTitleHeader: Locator;
  readonly articleBodyContent: Locator;
  readonly editArticleButton: Locator;
  readonly deleteArticleButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByPlaceholder('Article Title');
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.tagsInput = page.getByPlaceholder('Enter tags');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    this.articleTitleHeader = page.locator('h1');
    this.articleBodyContent = page.locator('.article-content');
    this.editArticleButton = page.getByRole('link', { name: 'Edit Article' }).first();
    this.deleteArticleButton = page.getByRole('button', { name: 'Delete Article' }).first();
  }

  async navigateToEditor() {
    await this.page.goto('/editor');
  }

  async fillAndPublishArticle(title: string, desc: string, body: string, tag?: string) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(desc);
    await this.bodyInput.fill(body);
    if (tag) {
      await this.tagsInput.fill(tag);
      await this.tagsInput.press('Enter');
    }
    await this.publishButton.click();
  }

  async updateArticle(updatedTitle: string, updatedBody: string) {
    await this.editArticleButton.click();
    await this.titleInput.fill(updatedTitle);
    await this.bodyInput.fill(updatedBody);
    await this.publishButton.click();
  }

  async deleteArticle() {
    const dialogPromise = this.page.waitForEvent('dialog');
    await this.deleteArticleButton.click();
    const dialog = await dialogPromise;
    await dialog.accept();
  }
}