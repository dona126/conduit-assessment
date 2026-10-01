import { test, expect } from '@playwright/test';
import { ConduitApiClient } from '../../src/api/ConduitApiClient';
import { ArticlePage } from '../../src/pages/ArticlePage';
import { createUserData, createArticleData } from '../../src/utils/testData';

test.describe('E2E Article Lifecycle Journey', () => {
  test('Create -> Edit -> Verify -> Delete Article', async ({ page, request }) => {
    const apiClient = new ConduitApiClient(request);
    const userData = createUserData();
    const { token } = await apiClient.registerUser(userData);

    const articlePage = new ArticlePage(page);
    await articlePage.injectAuthToken(token);

    const articleData = createArticleData();
    await articlePage.navigateToEditor();
    await articlePage.fillAndPublishArticle(
      articleData.title,
      articleData.description,
      articleData.body,
      'playwright'
    );

    await expect(articlePage.articleTitleHeader).toHaveText(articleData.title);
    await expect(articlePage.articleBodyContent).toContainText(articleData.body);

    const updatedTitle = `${articleData.title} Edited`;
    const updatedBody = `${articleData.body} Updated.`;
    await articlePage.updateArticle(updatedTitle, updatedBody);

    await expect(articlePage.articleTitleHeader).toHaveText(updatedTitle);
    await expect(articlePage.articleBodyContent).toContainText(updatedBody);

    await articlePage.deleteArticle();
    await page.waitForURL('**/');
    await expect(page.locator(`text=${updatedTitle}`)).toHaveCount(0);
  });
});