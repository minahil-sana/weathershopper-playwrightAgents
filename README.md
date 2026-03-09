# Weather Shopper Playwright Agents

End-to-end Playwright test suite for the Weather Shopper demo app built using Playwright Agents only (no manual code intervention):
`http://weathershopper.pythonanywhere.com`

This project includes:
- Single end-to-end purchase flow based on live temperature
- Temperature-based route selection (moisturizer/sunscreen)
- Product selection by keyword and least price
- Cart validation, Stripe checkout, and confirmation validation

## Tech Stack

- Node.js
- TypeScript-style Playwright tests (`@playwright/test`)
- Playwright test runner

## Project Structure (Original)

```text
.
|-- playwright.config.ts
|-- PLAYWRIGHT_AGENTS_WORKFLOW.md
|-- seed.spec.ts
|-- tests/
|   |-- helpers.ts
|   |-- temperature-path-selection.spec.ts
|   |-- moisturizer-purchase-flow.spec.ts
|   |-- sunscreen-purchase-flow.spec.ts
|   |-- cart-validation.spec.ts
|   |-- stripe-checkout-success.spec.ts
|   |-- stripe-checkout-validation.spec.ts
|   |-- confirmation-page-validation.spec.ts
|   `-- e2e-temperature-based-purchase-success.spec.ts
|-- specs/
|   |-- README.md
|   `-- weather-shopper-purchase-flow.testplan.md
`-- package.json
```

## Project Structure (Current)

```text
.
|-- .git/
|-- .github/
|-- .gitignore
|-- .vscode/
|-- node_modules/
|-- package-lock.json
|-- package.json
|-- playwright.config.ts
|-- PLAYWRIGHT_AGENTS_WORKFLOW.md
|-- README.md
|-- seed.spec.ts
|-- specs/
|   |-- README.md
|   `-- weather-shopper-purchase-flow.testplan.md
`-- tests/
    `-- e2e-temperature-based-purchase-success.spec.ts
```

## Project Guide

The project directory also contains a complete setup and build-flow guide:
- `PLAYWRIGHT_AGENTS_WORKFLOW.md` (setup steps, prompts used, and execution flow)

Latest addition in planning:
- `specs/weather-shopper-purchase-flow.testplan.md` now also captures a single end-to-end temperature-based journey variant.

## Prerequisites

- Node.js 18+ recommended
- npm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers (if not already installed):

```bash
npx playwright install
```

## Running Tests

Run all tests:

```bash
npx playwright test tests
```

Run a single test file:

```bash
npx playwright test tests/e2e-temperature-based-purchase-success.spec.ts
```

Run in headed mode:

```bash
npx playwright test tests/e2e-temperature-based-purchase-success.spec.ts --headed
```

Show HTML report after a run:

```bash
npx playwright show-report
```

## Notes

- Tests run against a live external site, so product catalog data and temperature can vary between runs.
- Stripe checkout uses test card data in the hosted test mode flow.
- Historical multi-test files are documented in `PLAYWRIGHT_AGENTS_WORKFLOW.md` under original/previous structure sections.
