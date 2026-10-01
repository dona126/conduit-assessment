import { test, expect } from '@playwright/test';
import { ConduitApiClient } from '../../src/api/ConduitApiClient';
import { createUserData, createArticleData } from '../../src/utils/testData';

test.describe('Conduit API - Pure REST CRUD cycle', () => {
  let apiClient: ConduitApiClient;
  const apiBase = 'https://conduit-api.bondaracademy.com/api';

  test.beforeEach(({ request }) => {
    apiClient = new ConduitApiClient(request, apiBase);
  });

  test('drive full user registration and article CRUD via REST API', async ({ request }) => {
    const userData = createUserData();
    const { token } = await apiClient.registerUser(userData);
    expect(token).toBeTruthy();

    const articleData = createArticleData();
    const createdArticle = await apiClient.createArticle(token, articleData);
    expect(createdArticle.title).toBe(articleData.title);
    expect(createdArticle.slug).toBeTruthy();

    const fetchResponse = await request.get(`${apiBase}/articles/${createdArticle.slug}`);
    expect(fetchResponse.status()).toBe(200);

    const updatedTitle = `${articleData.title} - UPDATED`;
    const updateResponse = await request.put(`${apiBase}/articles/${createdArticle.slug}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      data: { article: { title: updatedTitle } },
    });
    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();
    const updatedSlug = updateBody.article.slug;

    const deleteResponse = await apiClient.deleteArticle(token, updatedSlug);
    expect(deleteResponse.status()).toBe(204);

    const verifyDeleted = await request.get(`${apiBase}/articles/${updatedSlug}`);
    expect(verifyDeleted.status()).toBe(404);
  });
});