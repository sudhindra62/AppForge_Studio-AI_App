# AppForge AI Verification & Certification Testing

This repository contains the test infrastructure required to verify and certify the functionality, security, and performance of the AppForge AI application.

## Directory Structure

- **/e2e**: Playwright browser tests covering critical user flows.
- **/api**: Vitest API tests covering all exposed endpoints.
- **/database**: Vitest tests to ensure database operations, triggers, and logging.
- **/security**: Tests specifically checking for vulnerabilities like IDOR, CSRF, XSS.
- **/performance**: Tests to measure API latency, render speeds, and memory usage.
- **/reports**: Generated test reports and evidence.

## Commands

- `npm run verify` : Run all verification tests (E2E, API, DB).
- `npm run test:e2e` : Run end-to-end tests headless.
- `npm run test:e2e:ui` : Open Playwright UI to run and debug tests interactively.
- `npm run test:api` : Run backend API tests.
- `npm run test:db` : Run database operation tests.
- `npm run report` : Start the server to view the E2E HTML report.
- `npm run certify` : Run all tests and generate certification trace reports.
