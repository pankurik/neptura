import type { Cart, Collection, Image, Product, ProductVariant } from "./types";

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 100) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            product {
              title
              handle
            }
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

export const getProductsQuery = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const getProductsByHandlesQuery = `
  query getProductsByHandles($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          handle
          title
          description
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const getProductQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      featuredImage {
        url
        altText
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      options {
        name
        values
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            selectedOptions {
              name
              value
            }
            price {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

export const getCollectionsQuery = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const getCartQuery = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ${CART_FIELDS}
    }
  }
`;

export const createCartMutation = `
  mutation createCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const cartLinesAddMutation = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const cartLinesUpdateMutation = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const cartLinesRemoveMutation = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface RawCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  } | null;
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          product: { title: string; handle: string };
          price: { amount: string; currencyCode: string };
          image: Image | null;
        };
      };
    }[];
  };
}

function normalizeCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: raw.lines.edges.map((edge) => edge.node),
  };
}

function normalizeProduct(raw: {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: Image | null;
  images?: { edges: { node: Image }[] };
  options?: { name: string; values: string[] }[];
  variants?: { edges: { node: ProductVariant }[] };
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
}): Product {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    featuredImage: raw.featuredImage,
    images: raw.images?.edges.map((edge) => edge.node) ?? [],
    options: raw.options ?? [],
    variants: raw.variants?.edges.map((edge) => edge.node) ?? [],
    priceRange: raw.priceRange,
  };
}

function normalizeProductSummary(raw: {
  id: string;
  handle: string;
  title: string;
  description: string;
  featuredImage: Image | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
}): Product {
  return {
    ...raw,
    images: [],
    options: [],
    variants: [],
    priceRange: raw.priceRange,
  };
}

const catalogCache = { revalidate: 3600 };

export async function getProducts(first = 24): Promise<Product[]> {
  const { shopifyFetch } = await import("./shopify");
  const data = await shopifyFetch<{
    products: { edges: { node: Parameters<typeof normalizeProductSummary>[0] }[] };
  }>({
    query: getProductsQuery,
    variables: { first },
    tags: ["products"],
    ...catalogCache,
  });
  return data.products.edges.map((edge) => normalizeProductSummary(edge.node));
}

export async function getProductsByHandles(handles: string[]): Promise<Product[]> {
  const uniqueHandles = Array.from(new Set(handles.filter(Boolean)));

  if (uniqueHandles.length === 0) {
    return [];
  }

  const { shopifyFetch } = await import("./shopify");
  const query = uniqueHandles.map((handle) => `handle:${handle}`).join(" OR ");
  const data = await shopifyFetch<{
    products: { edges: { node: Parameters<typeof normalizeProductSummary>[0] }[] };
  }>({
    query: getProductsByHandlesQuery,
    variables: { query, first: uniqueHandles.length },
    cache: "no-store",
  });

  const byHandle = new Map(
    data.products.edges.map((edge) => [edge.node.handle, normalizeProductSummary(edge.node)])
  );

  return handles
    .map((handle) => byHandle.get(handle))
    .filter((product): product is Product => Boolean(product));
}

export async function getProduct(handle: string): Promise<Product | null> {
  const { shopifyFetch } = await import("./shopify");
  const data = await shopifyFetch<{ product: Parameters<typeof normalizeProduct>[0] | null }>({
    query: getProductQuery,
    variables: { handle },
    tags: [`product-${handle}`],
    ...catalogCache,
  });
  return data.product ? normalizeProduct(data.product) : null;
}

export async function getCollections(first = 24): Promise<Collection[]> {
  const { shopifyFetch } = await import("./shopify");
  const data = await shopifyFetch<{
    collections: { edges: { node: Collection }[] };
  }>({
    query: getCollectionsQuery,
    variables: { first },
    tags: ["collections"],
    ...catalogCache,
  });
  return data.collections.edges.map((edge) => edge.node);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const { shopifyFetch } = await import("./shopify");
  const data = await shopifyFetch<{ cart: RawCart | null }>({
    query: getCartQuery,
    variables: { cartId },
    cache: "no-store",
  });
  return data.cart ? normalizeCart(data.cart) : null;
}

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[] = []
): Promise<Cart | null> {
  const { shopifyFetch } = await import("./shopify");
  const data = await shopifyFetch<{
    cartCreate: { cart: RawCart | null; userErrors: { message: string }[] };
  }>({
    query: createCartMutation,
    variables: { lines },
    cache: "no-store",
  });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }

  return data.cartCreate.cart ? normalizeCart(data.cartCreate.cart) : null;
}

export async function cartLinesAdd(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart | null> {
  const { shopifyFetch } = await import("./shopify");
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: RawCart | null; userErrors: { message: string }[] };
  }>({
    query: cartLinesAddMutation,
    variables: { cartId, lines },
    cache: "no-store",
  });

  if (data.cartLinesAdd.userErrors.length > 0) {
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }

  return data.cartLinesAdd.cart ? normalizeCart(data.cartLinesAdd.cart) : null;
}

export async function cartLinesUpdate(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart | null> {
  const { shopifyFetch } = await import("./shopify");
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: RawCart | null; userErrors: { message: string }[] };
  }>({
    query: cartLinesUpdateMutation,
    variables: { cartId, lines },
    cache: "no-store",
  });

  if (data.cartLinesUpdate.userErrors.length > 0) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message);
  }

  return data.cartLinesUpdate.cart ? normalizeCart(data.cartLinesUpdate.cart) : null;
}

export async function cartLinesRemove(
  cartId: string,
  lineIds: string[]
): Promise<Cart | null> {
  const { shopifyFetch } = await import("./shopify");
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: RawCart | null; userErrors: { message: string }[] };
  }>({
    query: cartLinesRemoveMutation,
    variables: { cartId, lineIds },
    cache: "no-store",
  });

  if (data.cartLinesRemove.userErrors.length > 0) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }

  return data.cartLinesRemove.cart ? normalizeCart(data.cartLinesRemove.cart) : null;
}
