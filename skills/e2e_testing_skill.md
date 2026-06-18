# Automated E2E Testing Skill

This skill defines the guidelines and procedures for AI agents to write, debug, and run end-to-end (E2E) integration tests using Playwright and Chrome DevTools in the NoteFlash project.

## 1. Test Architecture & Directory Layout
- E2E tests are located in `apps/web/e2e/`.
- Test files should be named `[feature].spec.ts` (e.g., `notes.spec.ts`, `auth.spec.ts`).
- Avoid hardcoding test configurations; import base configurations from `playwright.config.ts`.

## 2. Browser DevTools & Agent Execution
- When diagnosing UI test failures, leverage the `chrome-devtools-plugin` to take screenshots, inspect elements, and analyze console errors.
- Run tests in headed/headless mode using `npx playwright test`.

## 3. Test Isolation & Auth State
- Tests should not interfere with each other's state. Generate unique titles or clean up data after execution.
- Use Playwright's `storageState` to reuse authenticated login states where possible, avoiding logging in repeatedly before every single test.
- Keep test data separate by prefixing test records (e.g., `[Test] My First Note`).

## 4. Best Practices for Selectors & Assertions
- Use resilient user-facing selectors like `getByRole`, `getByText`, or `getByLabel` instead of fragile CSS class pathways.
- Ensure all interactive elements (buttons, inputs) have unique, descriptive IDs or accessibility names.
- Prefer web-first assertions (e.g., `expect(page.getByText('Saved')).toBeVisible()`) which automatically wait for elements to reach the desired state.
