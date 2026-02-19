const DEFAULT_API_VERSION = '2025-01';

const CHECKOUT_CREATE_QUERY = `
mutation CheckoutCreate($input: CheckoutCreateInput!) {
  checkoutCreate(input: $input) {
    checkout { id webUrl }
    userErrors { field message }
  }
}`;

export function getServerShopifyConfig() {
  return {
    domain: process.env.SHOPIFY_STORE_DOMAIN,
    token: process.env.SHOPIFY_STOREFRONT_TOKEN_SERVER,
    apiVersion: process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION,
  };
}

export async function serverStorefrontQuery({ query, variables = {}, config = getServerShopifyConfig() }) {
  if (!config.domain || !config.token) {
    return { data: null, errors: [{ message: 'Shopify server Storefront API credentials are missing.' }] };
  }

  const response = await fetch(`https://${config.domain}/api/${config.apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  const networkErrors = response.ok ? [] : [{ message: `Shopify request failed (${response.status})` }];

  return {
    data: payload.data ?? null,
    errors: [...networkErrors, ...(payload.errors ?? [])],
  };
}

export async function createCheckoutFromCart(lineItems = []) {
  const normalizedItems = lineItems
    .map((item) => ({ variantId: item.variantId, quantity: Number(item.qty) || 0 }))
    .filter((item) => item.variantId && item.quantity > 0);

  if (!normalizedItems.length) {
    return { checkoutUrl: null, errors: [{ message: 'Cart is empty.' }] };
  }

  const { data, errors } = await serverStorefrontQuery({
    query: CHECKOUT_CREATE_QUERY,
    variables: { input: { lineItems: normalizedItems } },
  });

  const userErrors = data?.checkoutCreate?.userErrors ?? [];
  const checkoutUrl = data?.checkoutCreate?.checkout?.webUrl ?? null;

  return {
    checkoutUrl,
    errors: [...errors, ...userErrors.map((error) => ({ message: error.message, field: error.field }))],
  };
}
