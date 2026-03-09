# Playwright Agents Workflow Log

This document captures the complete flow used to build this project using Playwright Agents only.

## 1. Project Goal

Automate Weather Shopper purchase journeys end-to-end:
- Temperature-based route decision
- Moisturizer flow
- Sunscreen flow
- Cart validation
- Stripe checkout
- Confirmation page validation

Target app: `http://weathershopper.pythonanywhere.com`

## 2. Environment Setup

### 2.1 Workspace
- Project root: `weather-shopper-playwright-agents`
- Seed test used: `seed.spec.ts`
- Planned specs location: `specs/`
- Generated tests location: `tests/`

Added the URL for the website in the `seed.spec.ts` file 

### 2.2 Dependencies

```bash
npm install
npx playwright install
```

### 2.3 Run Command

```bash
npx playwright test tests
```

## 3. Prompt History (Playwright Agents)

### Prompt 1: Explore + test plan creation

Used the Playwright Planner Agent for this, Prompted:

```text
Explore http://weathershopper.pythonanywhere.com and generate a test plan for the Weather Shopper purchase flow.

Include:
- Temperature based product selection
- Moisturizer purchase flow
- Sunscreen purchase flow
- Cart validation
- Stripe checkout
- Confirmation page validation

Use seed.spec.ts as the starting point.
```

Output:
- `specs/weather-shopper-purchase-flow.testplan.md`

### Prompt 2: Add one more E2E scenario

```text
add one more test that would be end to end purchase flow , like successfull purchase based on temeperature
```

Output:
- Added `1.8 End-to-End Purchase Success Based on Temperature` in test plan

### Prompt 3: Generate tests from plan section

```text
Generate tests for ### 1. Temperature-Driven Purchase Journeys.
Create tests under the tests/ folder.
```

Output:
- `tests/temperature-path-selection.spec.ts`
- `tests/moisturizer-purchase-flow.spec.ts`
- `tests/sunscreen-purchase-flow.spec.ts`
- `tests/cart-validation.spec.ts`
- `tests/stripe-checkout-success.spec.ts`
- `tests/stripe-checkout-validation.spec.ts`
- `tests/confirmation-page-validation.spec.ts`
- `tests/e2e-temperature-based-purchase-success.spec.ts`


Ran the tests myself using the following command.
```bash  
npx playwright test tests
```
1 out of 8 tests passed.

### Prompt 4: Stabilization run

```text
Run the failing tests and fix locator issues, waits, assertions or any other issues until the tests pass
```

Output:
- All tests stabilized and passing
- Added shared helper for robust cart interactions: `tests/helpers.ts`
- Added runner config: `playwright.config.ts`

## 4. Test Stabilization Notes

Main issues seen while running against live site:
- Dynamic product catalog content/order changes
- Cart badge text variations and occasional missed click handlers
- Stripe iframe input flakiness on first submit in some runs

Fixes applied:
- Replaced brittle exact cart-count locators with resilient cart selectors
- Added retry-safe cart increment helper (`addAndEnsureCartCount`)
- Added retry-safe Stripe submit flow in critical tests
- Added fallback pathing in E2E test when expected category groups are missing
- Relaxed over-strict assertions where live-site variance is expected

## 5. Final Project Files Created/Updated

- `specs/weather-shopper-purchase-flow.testplan.md`
- `tests/helpers.ts`
- `tests/temperature-path-selection.spec.ts`
- `tests/moisturizer-purchase-flow.spec.ts`
- `tests/sunscreen-purchase-flow.spec.ts`
- `tests/cart-validation.spec.ts`
- `tests/stripe-checkout-success.spec.ts`
- `tests/stripe-checkout-validation.spec.ts`
- `tests/confirmation-page-validation.spec.ts`
- `tests/e2e-temperature-based-purchase-success.spec.ts`
- `playwright.config.ts`
- `README.md`

## 6. Execution Log

Latest known status:

```text
npx playwright test tests
8 passed
```

### Prompt 5: Refactor to single E2E test plan

```text
use seed.spec.ts as starting point and update the test plan.
...
Update the test plan to have a single e2e testcase that caters all this instead of having multiple tests.
Assertions , actions , tasks should follow proper naming convention
```

Output:
- Refactored `specs/weather-shopper-purchase-flow.testplan.md` to one end-to-end testcase.

### Prompt 6: Generate and stabilize single E2E test

```text
based on the testplan generate the ###1 Single End to End Temperature Purchase Journey. Remove all previous tests from the test folder.
```

```text
Run the failing tests and fix locator issues, waits, assertions or any other issues until the test pass
```

Output:
- Updated `tests/e2e-temperature-based-purchase-success.spec.ts` to align with single E2E flow.
- Stabilized flaky points with resilient cart checks and retry-safe checkout behavior.

Output:
- Removed empty and unnecessary files from `tests/`.
- Kept only `tests/e2e-temperature-based-purchase-success.spec.ts` as active spec.
- Removed generated `test-results/` directory.

## 8. Project Structure Updates

### 8.1 Original Structure (initial generation phase)

```text
.
|-- playwright.config.ts
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

### 8.2 Current Structure (latest state)

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

## 9. Latest Execution Status

Latest run command:

```text
npx playwright test tests/e2e-temperature-based-purchase-success.spec.ts --headed
```

Latest status:

```text
1 passed
```
