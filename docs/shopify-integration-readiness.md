# Shopify Integration Readiness Review

## Current storefront capability baseline
- Product listing is fetched server-side in Astro and rendered through a React island for cart operations.
- Product detail pages are fetched by handle and rendered server-side.
- Checkout starts through a server API route that creates a Shopify cart and redirects to its `checkoutUrl`.
- Cart state is currently browser-local only (`localStorage`) and is not persisted to Shopify until checkout is requested.

## Risks found during analysis

### 1) API logic was previously duplicated and inconsistent
The storefront and checkout code paths previously repeated request setup in multiple files, making Shopify version upgrades and error-handling changes risky and easy to miss.

**Mitigation implemented:**
- Centralized public Storefront API reads in `src/lib/shopify.js`.
- Centralized server-side cart creation mutation in `src/lib/shopify.server.js`.

### 2) Operational errors were opaque
When Shopify returned non-200 responses or GraphQL errors, UI behavior could silently degrade.

**Mitigation implemented:**
- Added normalized `errors` arrays from all Shopify helper calls.
- Added clearer empty-state messaging for missing credentials vs. no published products.

### 3) Integration is MVP-level and not cart-native to Shopify
The cart is local-only and does not use Shopify Cart API objects (`cartCreate`, `cartLinesAdd`, etc.), which limits multi-device continuity and analytics quality.

**Preparation recommendations (next milestones):**
1. Replace local cart with Shopify Cart API IDs stored in secure cookies/local storage.
2. Continue expanding `cartCreate` + `cartLinesUpdate` flow to persist and rehydrate cart IDs across sessions.
3. Add region-aware pricing and market context where required.

## Readiness checklist for production integration

### Credentials and access
- [ ] Verify Storefront token has minimum required scopes.
- [ ] Keep server token non-public and rotate via secrets manager.
- [ ] Pin and periodically upgrade `SHOPIFY_API_VERSION`.

### Headless channel configuration
- [ ] Ensure products are published to the **Headless** sales channel in Shopify admin.
- [ ] Verify the Storefront token belongs to the Headless channel app configuration.
- [ ] Validate checkout domain and payment methods in the market where this storefront is served.

### Data quality
- [ ] Ensure all products to be listed are published to the Storefront sales channel.
- [ ] Validate image alt text and variant metadata completeness.
- [ ] Confirm SKU and inventory values are present for operational reporting.

### Checkout and order flow
- [ ] Validate tax/shipping behavior across target regions.
- [ ] Add explicit handling for sold-out variants at checkout initiation.
- [ ] Add fallback UX when Shopify checkout URL creation fails.

### Observability and resilience
- [ ] Add structured logs for Shopify request failures (status, operation name, error fields).
- [ ] Add synthetic checks for product listing and checkout creation endpoints.
- [ ] Add rate-limit aware retry policy for transient 429/5xx responses.

## Suggested implementation order
1. Cart API migration (highest impact for reliability and platform alignment).
2. Webhook receiver for order and fulfillment state updates.
3. Analytics instrumentation (add-to-cart, begin-checkout, purchase).
4. Search/filter enhancements via Shopify metadata or external search indexing.
