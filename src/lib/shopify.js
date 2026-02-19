const DEFAULT_API_VERSION = '2025-01';

export const GET_PRODUCTS_QUERY = `
query GetProducts($first: Int = 12) {
  products(first: $first) {
    edges {
      node {
        id
        handle
        title
        description
        images(first: 3) { edges { node { url altText } } }
        variants(first: 5) {
          edges { node { id title availableForSale priceV2 { amount currencyCode } sku } }
        }
      }
    }
  }
}`;

export const GET_PRODUCT_BY_HANDLE_QUERY = `
query ProductByHandle($handle: String!) {
  productByHandle(handle: $handle) {
    id
    handle
    title
    description
    images(first: 10) { edges { node { url altText } } }
    variants(first: 10) { edges { node { id title availableForSale priceV2 { amount currencyCode } sku } } }
  }
}`;

function getPublicConfig() {
  const domain = import.meta.env.PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
  const apiVersion = import.meta.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION;

  return { domain, token, apiVersion };
}

export function getStorefrontEndpoint(config = getPublicConfig()) {
  return `https://${config.domain}/api/${config.apiVersion}/graphql.json`;
}

export async function storefrontQuery({ query, variables = {}, config = getPublicConfig() }) {
  if (!config.domain || !config.token) {
    return { data: null, errors: [{ message: 'Shopify public Storefront API credentials are missing.' }] };
  }

  const response = await fetch(getStorefrontEndpoint(config), {
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

export async function fetchProducts(first = 24) {
  const { data, errors } = await storefrontQuery({
    query: GET_PRODUCTS_QUERY,
    variables: { first },
  });

  return {
    products: data?.products?.edges?.map((edge) => edge.node) ?? [],
    errors,
  };
}

export async function fetchProductByHandle(handle) {
  const { data, errors } = await storefrontQuery({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });

  return {
    product: data?.productByHandle ?? null,
    errors,
  };
}
