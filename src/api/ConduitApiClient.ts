import { APIRequestContext, expect } from '@playwright/test';

export class ConduitApiClient {
  private request: APIRequestContext;
  private apiBaseUrl: string;

  constructor(request: APIRequestContext, apiBaseUrl = 'https://conduit-api.bondaracademy.com/api') {
    this.request = request;
    this.apiBaseUrl = apiBaseUrl;
  }

  async registerUser(userData: { username: string; email: string; password: string }) {
    const response = await this.request.post(`${this.apiBaseUrl}/users`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: { user: userData },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`Failed to register user (Status: ${response.status()}): ${errorBody}`);
    }

    expect(response.status()).toBe(201);
    const body = await response.json();
    return { token: body.user.token, user: body.user };
  }

  async createArticle(token: string, articleData: { title: string; description: string; body: string; tagList: string[] }) {
    const response = await this.request.post(`${this.apiBaseUrl}/articles`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      data: { article: articleData },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`Failed to create article (Status: ${response.status()}): ${errorBody}`);
    }

    expect(response.status()).toBe(201);
    const body = await response.json();
    return body.article;
  }

  async deleteArticle(token: string, slug: string) {
    return await this.request.delete(`${this.apiBaseUrl}/articles/${slug}`, {
      headers: { Authorization: `Token ${token}` },
    });
  }
}