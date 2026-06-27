import { useState, useEffect, useCallback } from 'react';

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const API_URL = `https://${DOMAIN}/api/2024-01/graphql.json`;

const CART_KEY = 'cb_cart_id';

async function shopifyFetch(query: string, variables: Record<string, unknown>) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  return res.json();
}

const GET_CART = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      checkoutUrl
      totalQuantity
    }
  }
`;

const CART_CREATE = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors { field message }
    }
  }
`;

export function useShopifyCart() {
  const [cartId, setCartId] = useState<string | null>(() => localStorage.getItem(CART_KEY));
  const [cartCount, setCartCount] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    if (!cartId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await shopifyFetch(GET_CART, { cartId });
        if (cancelled) return;
        if (data?.cart) {
          setCheckoutUrl(data.cart.checkoutUrl);
          setCartCount(data.cart.totalQuantity);
        } else {
          localStorage.removeItem(CART_KEY);
          setCartId(null);
          setCartCount(0);
          setCheckoutUrl(null);
        }
      } catch {
        if (cancelled) return;
        localStorage.removeItem(CART_KEY);
        setCartId(null);
        setCartCount(0);
        setCheckoutUrl(null);
      }
    })();
    return () => { cancelled = true; };
  }, [cartId]);

  const addToCart = useCallback(async (variantId: string, productName: string) => {
    setIsLoading(true);
    try {
      const merchandiseId = `gid://shopify/ProductVariant/${variantId}`;
      const currentCartId = localStorage.getItem(CART_KEY);

      if (!currentCartId) {
        const { data } = await shopifyFetch(CART_CREATE, {
          input: { lines: [{ merchandiseId, quantity: 1 }] },
        });
        const cart = data?.cartCreate?.cart;
        if (cart) {
          localStorage.setItem(CART_KEY, cart.id);
          setCartId(cart.id);
          setCheckoutUrl(cart.checkoutUrl);
          setCartCount(cart.totalQuantity);
        }
      } else {
        const { data } = await shopifyFetch(CART_LINES_ADD, {
          cartId: currentCartId,
          lines: [{ merchandiseId, quantity: 1 }],
        });
        const cart = data?.cartLinesAdd?.cart;
        if (cart) {
          setCheckoutUrl(cart.checkoutUrl);
          setCartCount(cart.totalQuantity);
        }
      }
      setLastAdded(productName);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openCheckout = useCallback(() => {
    if (checkoutUrl) window.open(checkoutUrl, '_blank');
  }, [checkoutUrl]);

  const clearLastAdded = useCallback(() => setLastAdded(null), []);

  return { cartCount, isLoading, lastAdded, addToCart, openCheckout, clearLastAdded };
}
