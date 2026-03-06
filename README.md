# Weather Shopper Playwright Agents

End-to-end Playwright test suite for the Weather Shopper demo app built using Playwrigt Agents only(no manual code intervention):
`http://weathershopper.pythonanywhere.com`

This project includes:
- Temperature-driven product path validation
- Moisturizer and sunscreen purchase flows
- Cart integrity validation
- Stripe checkout happy path and validation scenarios
- Confirmation page validation
- Full end-to-end purchase flow based on live temperature

## Tech Stack

- Node.js
- TypeScript-style Playwright tests (`@playwright/test`)
- Playwright test runner

## Project Structure

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

## Project Guide

The project directory also contains a complete setup and build-flow guide:
- `PLAYWRIGHT_AGENTS_WORKFLOW.md` (setup steps, prompts used, and execution flow)

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
npx playwright test tests/temperature-path-selection.spec.ts
```

Show HTML report after a run:

```bash
npx playwright show-report
```

## Notes

- Tests run against a live external site, so product catalog data and temperature can vary between runs.
- The suite includes resilient helpers (`tests/helpers.ts`) for cart and click stability on dynamic pages.
- Stripe checkout uses test card data in the hosted test mode flow.
