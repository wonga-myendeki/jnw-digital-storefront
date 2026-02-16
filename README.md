# JNW Digital Storefront (Astro + React)

A black-and-gold Shopify storefront MVP inspired by luxury mobile wine ecommerce layouts.

## Stack
- Astro + React islands (`client:load`)
- Tailwind CSS
- Framer Motion
- Shopify Storefront GraphQL API

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

## Environment variables
- `PUBLIC_SHOPIFY_STORE_DOMAIN`
- `PUBLIC_SHOPIFY_STOREFRONT_TOKEN`
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_TOKEN_SERVER`
- `SHOPIFY_API_VERSION`

`PUBLIC_*` variables are used for product reads. Server token is used by `src/pages/api/checkout.js`.
