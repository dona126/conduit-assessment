# Conduit Automation Framework (Playwright + TypeScript)

A test automation suite for the RealWorld Conduit application built with Playwright, TypeScript, and the Page Object Model (POM) pattern.



# Directory Structure

```text
conduit-assessment/
│
├── .github/
│   └── workflows/
│       └── playwright.yml             # CI workflow running on GitHub Actions
│
├── src/
│   ├── api/
│   │   └── ConduitApiClient.ts        # Centralized API client service
│   │
│   ├── pages/
│   │   ├── BasePage.ts                # Base page object with token injection
│   │   ├── AuthPage.ts                # POM for Register and Login flows
│   │   └── ArticlePage.ts             # POM for Article Editor, View, Edit, and Delete
│   │
│   └── utils/
│       └── testData.ts                # Dynamic test data generators
│
├── tests/
│   ├── api/
│   │   └── article-crud.api.spec.ts   # Pure REST API CRUD verification
│   │
│   └── e2e/
│       ├── article-lifecycle.spec.ts  # Hybrid E2E article lifecycle
│       ├── auth.spec.ts               # UI Register and Sign-in validation
│       └── permissions.spec.ts        # Cross-user authorization tests (API & UI)
│
├── playwright.config.ts               # Playwright runner configuration
├── tsconfig.json                      # TypeScript compiler configuration
├── package.json
└── README.md
```

# Setup & Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Install Project Dependencies
```bash
npm install
```

### Install Browser Binaries (Chromium)
```bash
npx playwright install --with-deps chromium
```

# Running the Tests

### Run All Test Suites

```bash
npx playwright test
```

### Run in Headed Browser Mode

```bash
npx playwright test --headed
```

### Run Only API Tests

```bash
npx playwright test tests/api/
```

### Run Only E2E Tests

```bash
npx playwright test tests/e2e/
```

### Open HTML Test Report

```bash
npx playwright show-report
```

# CI/CD Pipeline

The framework runs on GitHub Actions via `.github/workflows/playwright.yml`.

On every `push` and `pull_request` targeting `main`, the pipeline performs the following steps:

1. Checks out the repository code.
2. Sets up Node.js v20 with dependency caching.
3. Installs dependencies using `npm ci`.
4. Installs the required Playwright Chromium binary.
5. Executes the test suite.
6. Publishes the HTML report as an artifact on failure or completion.


# Permission & State Boundary Testing Approach

To prove that **User A cannot edit or delete an article belonging to User B**, we implemented a defense-in-depth verification strategy across both the **REST API** and **UI layers** in `tests/e2e/permissions.spec.ts`:

1. **Test Setup & State Isolation**:
   - Two distinct users (User A and User B) are provisioned independently with isolated credentials and JWT tokens via `ConduitApiClient`.
   - User A creates an article via the API, generating a target resource slug.

2. **API Layer Security Boundary (IDOR / Broken Object-Level Authorization)**:
   - User B attempts to issue direct `PUT` (edit) and `DELETE` requests against User A's article slug using User B's own bearer token.
   - The framework asserts that the API strictly rejects both attempts with HTTP status code `403 Forbidden`, proving server-side authorization enforcement cannot be bypassed by forging requests.

3. **UI Layer Security Boundary (Client-Side State & Control Leakage)**:
   - User B's session token is injected into the browser via `BasePage.injectAuthToken()`.
   - User B navigates directly via deep link to User A's article page (`/article/<user-a-slug>`).
   - The test asserts that the owner action controls—specifically the `Edit Article` link and `Delete Article` button—are completely omitted from the rendered DOM (`toHaveCount(0)`).

By testing both layers, we ensure the backend enforces strict authorization while the frontend maintains appropriate access boundaries without leaking privileged controls.

---

# Known Limitations

1. **Shared Public Demo Backend**:
   - The suite runs against a public hosted backend instance (`https://conduit-api.bondaracademy.com`). Network latency variations or scheduled server resets can introduce external delays outside the framework's control.

2. **Orphaned Test Data on Unexpected Abort**:
   - Articles are properly deleted as part of the test flow. However, if a test runner process is abruptly killed or terminated before reaching the teardown step, the generated test entity remains in the database until the demo backend's periodic wipe.


---

# What I Would Add With One More Day

1. **Automated Teardown Registry (`afterEach` / `afterAll`)**:
   - Implement an in-memory tracking registry within `ConduitApiClient` that records all created article slugs during a run and guarantees cleanup via an API bulk teardown hook, even if a test fails midway.

2. **Visual Regression Testing**:
   - Add snapshot comparison checks (`expect(page).toHaveScreenshot()`) for markdown article rendering and mobile viewports to prevent UI layout regressions.