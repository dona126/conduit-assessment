import { test, expect } from '@playwright/test';
import { ConduitApiClient } from '../../src/api/ConduitApiClient';
import { ArticlePage } from '../../src/pages/ArticlePage';
import { createUserData, createArticleData } from '../../src/utils/testData';

test.describe('E2E Article Lifecycle Journey', () => {
  test('Create -> Edit -> Verify -> Delete Article', async ({ page, request }) => {
    // 0. SEED USER & AUTH STATE (API-accelerated)
    const apiClient = new ConduitApiClient(request);
    const userData = createUserData();
    const { token } = await apiClient.registerUser(userData);

    const articlePage = new ArticlePage(page);
    await articlePage.injectAuthToken(token);

    // 1. CREATE
    const articleData = createArticleData();
    await articlePage.navigateToEditor();
    await articlePage.fillAndPublishArticle(
      articleData.title,
      articleData.description,
      articleData.body,
      'playwright'
    );

    // Initial state check after creation
    await expect(articlePage.articleTitleHeader).toHaveText(articleData.title);
    await expect(articlePage.articleBodyContent).toContainText(articleData.body);

    // 2. EDIT
    const updatedTitle = `${articleData.title} Edited`;
    const updatedBody = `${articleData.body} Updated.`;
    await articlePage.updateArticle(updatedTitle, updatedBody);

    // 3. VERIFY
    // Validates that title and Markdown body content updated in the DOM
    await expect(articlePage.articleTitleHeader).toHaveText(updatedTitle);
    await expect(articlePage.articleBodyContent).toContainText(updatedBody);

    // 4. DELETE
    // Handles the browser confirm popup and clicks Delete
    await articlePage.deleteArticle();

    // Verify deletion & redirection away from the article URL
    await page.waitForURL((url) => !url.pathname.includes('/article/'), { timeout: 10000 });
    await expect(page.getByRole('heading', { name: updatedTitle })).toBeHidden();
  });
});