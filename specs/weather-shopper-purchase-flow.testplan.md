# Weather Shopper Single E2E Temperature Purchase Test Plan

## Application Overview

Single end-to-end Weather Shopper test flow using seed.spec.ts, covering temperature-based route selection, product selection by keyword and price, cart validation, Stripe checkout, and confirmation validation in one continuous scenario. Assumption: fresh browser state with empty cart at test start.

## Test Scenarios

### 1. Single End-to-End Temperature Purchase Journey

**Seed:** `seed.spec.ts`

#### 1.1. E2E Temperature-Based Product Selection to Successful Payment Confirmation

**File:** `tests/e2e-temperature-based-purchase-success.spec.ts`

**Steps:**
  1. Navigate to the Weather Shopper home page.
    - expect: Page title should indicate current temperature page.
    - expect: Current temperature value should be visible and parseable as an integer.
  2. Read and store the temperature value.
    - expect: Stored temperature should be a valid numeric value.
  3. Route by temperature and click category CTA: if temperature < 19 click `Buy moisturizers`; if temperature > 34 click `Buy sunscreens`; otherwise follow deterministic default branch and record decision.
    - expect: Selected category page should open successfully.
    - expect: Selected category should match route rule derived from stored temperature.
  4. Validate destination page correctness against stored temperature decision.
    - expect: If stored temperature is below 19, destination page heading should be `Moisturizers`.
    - expect: If stored temperature is above 34, destination page heading should be `Sunscreens`.
  5. Verify cart state before adding products.
    - expect: Cart button should indicate empty cart state.
  6. Collect visible product cards and group by required keywords: moisturizer branch uses `Aloe` and `Almond`; sunscreen branch uses `SPF-50` and `SPF-30`.
    - expect: Required keyword groups for selected branch should be present.
    - expect: Each candidate product in required groups should have numeric price.
  7. Select and add the two least expensive products based on branch keyword rules, then store selected product names and prices.
    - expect: Exactly two qualifying products should be selected and stored.
    - expect: Cart button text should indicate `2 item(s)` in cart.
  8. Click the cart button.
    - expect: User should land on cart page successfully.
  9. Validate cart line items against stored selected products.
    - expect: Cart products should match the two stored product names.
    - expect: No unexpected additional product should appear.
  10. Validate cart total.
    - expect: Displayed total should equal sum of the two stored product prices.
  11. Click `Pay with Card` to open Stripe checkout.
    - expect: Stripe checkout modal/iframe should open.
    - expect: Payment amount should match cart total.
  12. Enter Stripe test checkout details (email, card number, expiry, CVC) and submit payment.
    - expect: Payment submission should be accepted without blocking validation errors.
  13. Verify post-payment navigation and confirmation content.
    - expect: User should land on `/confirmation` page.
    - expect: Success heading should be visible.
    - expect: Success message should confirm payment completion.
