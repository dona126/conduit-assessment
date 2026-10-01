import { test, expect } from '@playwright/test';
import { ConduitApiClient } from '../../src/api/ConduitApiClient';
import { ArticlePage } from '../../src/pages/ArticlePage';
import { createUserData, createArticleData } from '../../src/utils/testData';

test.describe('Security & Multi-Tenant Boundaries', () => {
  test('User B cannot edit or delete User A article via UI or API', async ({ page, request }) => {
    const apiClient = new ConduitApiClient(request);

    // User A registers and creates an article
    const userA = createUserData();
    const { token: tokenA } = await apiClient.registerUser(userA);
    const articleA = await apiClient.createArticle(tokenA, createArticleData());

    // User B registers
    const userB = createUserData();
    const { token: tokenB } = await apiClient.registerUser(userB);

    // 1. API Boundary: User B attempts modification of User A's article
    const unauthorizedEdit = await request.put(
      `https://conduit-api.bondaracademy.com/api/articles/${articleA.slug}`,
      {
        headers: { Authorization: `Token ${tokenB}` },
        data: { article: { title: 'Unauthorized Title' } },
      }
    );
    expect(unauthorizedEdit.status()).toBe(403);

    // 2. API Boundary: User B attempts deletion of User A's article
    const unauthorizedDelete = await request.delete(
      `https://conduit-api.bondaracademy.com/api/articles/${articleA.slug}`,
      {
        headers: { Authorization: `Token ${tokenB}` },
      }
    );
    expect(unauthorizedDelete.status()).toBe(403);

    // 3. UI Boundary: User B visits User A's article
    const articlePage = new ArticlePage(page);
    await articlePage.injectAuthToken(tokenB);
    await page.goto(`/article/${articleA.slug}`);

    // Verify Edit and Delete controls are not rendered for non-owner
    await expect(articlePage.articleTitleHeader).toHaveText(articleA.title);
    await expect(articlePage.editArticleButton).toHaveCount(0);
    await expect(articlePage.deleteArticleButton).toHaveCount(0);
  });
});