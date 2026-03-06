# Weather Shopper Purchase Flow Test Plan

## Application Overview

Comprehensive end-to-end test scenarios for Weather Shopper purchase journeys from temperature-based category decision through cart verification, Stripe checkout, and payment confirmation. All scenarios assume a fresh browser context and no pre-existing cart state.

## Test Scenarios

### 1. Temperature-Driven Purchase Journeys

**Seed:** `seed.spec.ts`

#### 1.1. Temperature-Based Product Path Selection on Home Page

**File:** `specs/temperature-path-selection.spec.ts`

**Steps:**
  1. Open the Weather Shopper home page.
    - expect: The page title is `Current Temperature`.
    - expect: A numeric temperature value with degree symbol is visible.
    - expect: Both `Buy moisturizers` and `Buy sunscreens` actions are visible and enabled.
  2. Read and store the displayed temperature value as an integer.
    - expect: The value can be parsed as a valid number.
  3. Apply routing rule check: if temperature is below 19, click `Buy moisturizers`; if temperature is above 34, click `Buy sunscreens`; otherwise pick one path explicitly and log that this is a neutral range run.
    - expect: For below-19 values, navigation reaches `/moisturizer`.
    - expect: For above-34 values, navigation reaches `/sunscreen`.
    - expect: For neutral range values, chosen path is deterministic and recorded in test logs.
  4. Verify destination page heading after navigation.
    - expect: Moisturizer path shows heading `Moisturizers`.
    - expect: Sunscreen path shows heading `Sunscreens`.
    - expect: Cart initially shows `Cart - Empty`.

#### 1.2. Moisturizer Purchase Flow with Product-Selection Rule

**File:** `specs/moisturizer-purchase-flow.spec.ts`

**Steps:**
  1. Navigate to `/moisturizer` from the home page in a fresh state.
    - expect: Moisturizer listing page loads successfully.
    - expect: Multiple products are displayed with names, prices, and `Add` buttons.
  2. Extract all moisturizer cards and split into two groups by name keyword: `Aloe` and `Almond`.
    - expect: At least one product exists in each required keyword group.
    - expect: Each grouped product has a numeric price.
  3. Within each group, identify the lowest-price product and click `Add` for exactly those two products.
    - expect: Cart badge updates from empty to `1 item(s)` then `2 item(s)`.
    - expect: No unintended third item is added.
  4. Open cart.
    - expect: Cart contains exactly the two selected moisturizer items.
    - expect: Item names in cart match selected products.
    - expect: Displayed total equals arithmetic sum of item prices.

#### 1.3. Sunscreen Purchase Flow with SPF Selection Rule

**File:** `specs/sunscreen-purchase-flow.spec.ts`

**Steps:**
  1. Navigate to `/sunscreen` from the home page in a fresh state.
    - expect: Sunscreen listing page loads successfully.
    - expect: Products display names that include SPF values and prices.
  2. Extract all sunscreen cards and separate into SPF-30 group and SPF-50 group based on product name text.
    - expect: At least one SPF-30 product is present.
    - expect: At least one SPF-50 product is present.
    - expect: Prices are numeric and comparable for both groups.
  3. Select and add the lowest-priced SPF-30 and the lowest-priced SPF-50 products.
    - expect: Cart badge increments correctly to `2 item(s)`.
    - expect: Only two target items are present in cart state.
  4. Open cart and validate pricing.
    - expect: Cart rows list the chosen SPF-30 and SPF-50 products.
    - expect: Total equals sum of the two chosen product prices.

#### 1.4. Cart Validation and Data Integrity

**File:** `specs/cart-validation.spec.ts`

**Steps:**
  1. From either product listing page, add two valid items.
    - expect: Cart badge reflects correct item count.
  2. Open cart and verify line-item table structure.
    - expect: Table has `Item` and `Price` columns.
    - expect: Each selected product appears exactly once with the correct displayed price.
  3. Compute expected total from line-item prices and compare with displayed `Total: Rupees ...`.
    - expect: Displayed total equals computed total.
    - expect: Currency label and number formatting are present and readable.
  4. Navigate back to a listing page and add one additional item, then reopen cart.
    - expect: Cart count and total both update consistently after the extra addition.
    - expect: No previously added items are lost unexpectedly.

#### 1.5. Stripe Checkout Happy Path

**File:** `specs/stripe-checkout-success.spec.ts`

**Steps:**
  1. Start with a non-empty cart and click `Pay with Card`.
    - expect: Stripe checkout modal/iframe opens.
    - expect: Pay button amount matches cart total.
    - expect: Required fields are visible: Email, Card number, MM/YY, CVC.
  2. Enter valid Stripe test data (for example: email `qa.tester@example.com`, card `4242424242424242`, expiry `12/30`, CVC `123`) and submit.
    - expect: Submission is accepted and processing starts without client-side validation errors.
  3. Wait for post-payment navigation.
    - expect: User is redirected to `/confirmation`.
    - expect: Confirmation page heading shows payment success text.
    - expect: Success message indicates payment completion and follow-up information.

#### 1.6. Stripe Checkout Validation and Failure Handling

**File:** `specs/stripe-checkout-validation.spec.ts`

**Steps:**
  1. Open Stripe checkout from a non-empty cart and attempt submit with all fields blank.
    - expect: Checkout does not navigate to confirmation.
    - expect: Validation feedback or blocked submission occurs within Stripe form.
  2. Enter invalid card details (for example malformed card number or invalid expiry) and submit.
    - expect: Payment is rejected by field validation or Stripe error.
    - expect: User remains on cart/checkout context and can retry.
  3. Enter a known declined Stripe test card number and submit.
    - expect: Payment is declined with visible error messaging.
    - expect: No success confirmation page is shown.

#### 1.7. Confirmation Page Validation

**File:** `specs/confirmation-page-validation.spec.ts`

**Steps:**
  1. Complete a successful payment once through Stripe.
    - expect: Navigation reaches `/confirmation`.
  2. Validate key confirmation content.
    - expect: Primary success heading is visible.
    - expect: Body message confirms successful payment.
    - expect: Footer links (such as About) remain visible and functional.
  3. Refresh confirmation page.
    - expect: Success message remains visible after refresh.
    - expect: No duplicate charge action is triggered by refresh.

#### 1.8. End-to-End Purchase Success Based on Temperature

**File:** `specs/e2e-temperature-based-purchase-success.spec.ts`

**Steps:**
  1. Open home page, read current temperature, and choose path dynamically: below 19 -> moisturizer flow, above 34 -> sunscreen flow, otherwise log neutral range and force one deterministic path for run stability.
    - expect: Chosen path is clearly logged with the evaluated temperature value.
    - expect: Navigation lands on the intended product listing page.
  2. If on moisturizer page, add the cheapest `Aloe` and cheapest `Almond` item; if on sunscreen page, add the cheapest SPF-30 and cheapest SPF-50 item.
    - expect: Exactly two products are added.
    - expect: Cart badge shows `2 item(s)` after selection.
    - expect: Selected items satisfy the category-specific selection rule.
  3. Open cart and verify item names, individual prices, and total.
    - expect: Cart rows match the selected products from previous step.
    - expect: Total equals sum of listed prices.
    - expect: `Pay with Card` is visible and enabled.
  4. Complete Stripe checkout with valid test card data and submit payment.
    - expect: Payment is processed without validation errors.
    - expect: User is redirected to `/confirmation`.
  5. Validate confirmation page.
    - expect: `PAYMENT SUCCESS` heading is visible.
    - expect: Success description message is present.
    - expect: Flow is marked passed only when routing, selection logic, checkout, and confirmation all succeed in one run.
