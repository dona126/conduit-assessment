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


# Part 2 — Think: the GSP scenario
### ❓ Q1. Coverage first: list the 8–10 journeys you would automate first for GSP and the ordering logic behind them.

> I would automate the following journeys first:
1. Create a new enquiry – Verify that a new student can be added successfully.
2. Move an enquiry to application – Verify that the application progresses correctly through the first stages.
3. Complete the document checklist – Verify that the correct documents are shown based on the selected destination market.
4. Validate missing mandatory documents – Make sure an application cannot move forward when required documents are missing.
5. Move an application through the main stages – Verify the important transitions from application → offer → CAS/visa → enrolment.
6. Agent access – Verify that an agent can see only their own students and cannot access another agent's students.
7. Admin document configuration – Verify that an admin can add or change required documents for a market.
8. Role-based access – Verify that Admin, Staff and Agent have access only to the actions allowed for their roles.
9. Application rejection/withdrawal – Verify that applications can be moved to the appropriate end state and cannot continue incorrectly.
10. End-to-end student journey – Create a student and take the application from enquiry through to enrolment.

Ordering logic:
I would start with the main business flow and the areas that could affect many users: application creation, documents and stage movement. Then I would cover permissions because incorrect access is a major risk, especially for agents. After that, I would cover less frequent scenarios such as configuration, rejection/withdrawal, and finally the complete end-to-end journey.

### ❓ Q2.  Provably safe permissions: describe how you would test the 3-role permission model so a regression cannot ship silently. Sketch the test matrix.

>I would test each role against the same set of actions and check both **what the user can see and what they can actually do**. I would also test direct URL/API access, not only the UI, so a permission issue cannot pass silently.

### Permission Test Matrix

| Action | Admin | Staff | Agent |
|---|---|---|---|
| View all students | Allow | Allow | Own students only |
| View another agent's student | Allow | Allow | Deny |
| Create student/application | Allow | Allow | Allow, if permitted |
| Edit student/application | Allow | Allow | Own students only |
| Move application stage | Allow | Allow | Own students only |
| Configure market documents | Allow | Deny | Deny |
| Manage users/roles | Allow | Deny | Deny |
| Delete student/application | Allow | Based on permission | Deny |
| Access another user's data through direct URL/API | Allow | Allow | Deny |

### How I Would Test It

For each role, I would:

1. Log in with the role and verify the correct UI actions are available.
2. Try actions that the role should **not** have access to.
3. Try accessing restricted records using a direct URL.
4. If APIs are available, send the same request directly through the API and verify it is rejected.
5. Verify that changing the role does not leave previously granted access behind.
6. Run these tests in CI on every pull request so a permission regression fails the pipeline instead of reaching production.

For the **Agent** role, I would specifically create students for two different agents and verify that each agent can access only their own students. This would be one of the critical regression tests because exposing another agent's students would be a serious authorization issue.

### ❓ Q3. 

>

### ❓ Q4. 

>