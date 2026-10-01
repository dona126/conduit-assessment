export const generateRandomString = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

export const createUserData = () => {
  const uniqueId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    username: `user${uniqueId}`,
    email: `test${uniqueId}@example.com`,
    password: 'Password123!',
  };
};

export const createArticleData = () => ({
  title: `Title ${generateRandomString('art')}`,
  description: 'Test description for the article',
  body: 'This is the comprehensive body of the test article containing markdown and text.',
  tagList: ['automation', 'playwright', 'testing'],
});