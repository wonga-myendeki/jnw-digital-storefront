export async function POST({ request }) {
  const SHOP = process.env.SHOPIFY_STORE_DOMAIN;
  const TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN_SERVER;
  const API_VER = process.env.SHOPIFY_API_VERSION || '2025-01';

  if (!SHOP || !TOKEN) {
    return new Response(JSON.stringify({ error: 'Shopify configuration missing.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const lineItems = (body.lineItems || []).map((item) => ({
    variantId: item.variantId,
    quantity: item.qty,
  }));

  if (!lineItems.length) {
    return new Response(JSON.stringify({ error: 'Cart is empty.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const query = `
    mutation CheckoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout { id webUrl }
        userErrors { field message }
      }
    }
  `;

  const response = await fetch(`https://${SHOP}/api/${API_VER}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables: { input: { lineItems } } }),
  });

  const result = await response.json();
  const errors = result.data?.checkoutCreate?.userErrors;
  const checkout = result.data?.checkoutCreate?.checkout;

  if (errors?.length) {
    return new Response(JSON.stringify({ error: errors[0].message, details: errors }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ webUrl: checkout?.webUrl }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
