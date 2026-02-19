const DEFAULT_API_VERSION = '2025-01';

const CART_CREATE_QUERY = `
mutation CartCreate($input: CartInput) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      totalQuantity
    }
    userErrors {
      field
      message
    }
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

export async function createCartCheckoutFromLineItems(lineItems = []) {
  const lines = lineItems
    .map((item) => ({ merchandiseId: item.variantId, quantity: Number(item.qty) || 0 }))
    .filter((item) => item.merchandiseId && item.quantity > 0);

  if (!lines.length) {
    return { checkoutUrl: null, cartId: null, errors: [{ message: 'Cart is empty.' }] };
  }

  const { data, errors } = await serverStorefrontQuery({
    query: CART_CREATE_QUERY,
    variables: { input: { lines } },
  });

  const userErrors = data?.cartCreate?.userErrors ?? [];
  const cart = data?.cartCreate?.cart;

  return {
    cartId: cart?.id ?? null,
    checkoutUrl: cart?.checkoutUrl ?? null,
    errors: [...errors, ...userErrors.map((error) => ({ message: error.message, field: error.field }))],
  };
}
