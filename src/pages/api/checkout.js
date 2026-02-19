import { createCheckoutFromCart } from '../../lib/shopify.server';

export async function POST({ request }) {
  const body = await request.json();
  const { checkoutUrl, errors } = await createCheckoutFromCart(body.lineItems || []);

  if (errors.length) {
    const status = errors.some((error) => String(error.message || '').includes('credentials are missing')) ? 500 : 400;
    return new Response(JSON.stringify({ error: errors[0].message, details: errors }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ webUrl: checkoutUrl }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
