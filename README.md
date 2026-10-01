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
