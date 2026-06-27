import { useState, useEffect, useCallback } from 'react';

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const API_URL = `https://${DOMAIN}/api/2024-01/graphql.json`;

const CART_KEY = 'cb_cart_id';

type CartLine = {
  id: string;
  quantity: number;
  linePrice: string;
  variantId: string;
  productName: string;
  variantTitle: string;
  imageUrl: string | null;
};

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

const GET_CART_DETAILS = `
  query GetCartDetails($cartId: ID!) {
    cart(id: $cartId) {
      checkoutUrl
      totalQuantity
      cost { totalAmount { amount currencyCode } }
      lines(first: 20) {
        edges {
          node {
            id
            quantity
            cost { totalAmount { amount } }
            merchandise {
              ... on ProductVariant {
                id
                title
                product { title }
                image { url }
              }
            }
          }
        }
      }
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

const CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        totalQuantity
        cost { totalAmount { amount } }
        lines(first: 20) {
          edges {
            node {
              id quantity
              cost { totalAmount { amount } }
              merchandise {
                ... on ProductVariant {
                  id title
                  product { title }
                  image { url }
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        totalQuantity
        cost { totalAmount { amount } }
        lines(first: 20) {
          edges {
            node {
              id quantity
              cost { totalAmount { amount } }
              merchandise {
                ... on ProductVariant {
                  id title
                  product { title }
                  image { url }
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

function mapEdgesToLines(edges: Array<{ node: Record<string, unknown> }>): CartLine[] {
  return edges.map((edge) => {
    const node = edge.node as {
      id: string;
      quantity: number;
      cost: { totalAmount: { amount: string } };
      merchandise: {
        id: string;
        title: string;
        product: { title: string };
        image: { url: string } | null;
      };
    };
    return {
      id: node.id,
      quantity: node.quantity,
      linePrice: node.cost.totalAmount.amount,
      variantId: node.merchandise.id,
      productName: node.merchandise.product.title,
      variantTitle: node.merchandise.title,
      imageUrl: node.merchandise.image?.url ?? null,
    };
  });
}

export function useShopifyCart() {
  const [cartId, setCartId] = useState<string | null>(() => localStorage.getItem(CART_KEY));
  const [cartCount, setCartCount] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartTotal, setCartTotal] = useState<string>('0');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_KEY);
    setCartId(null);
    setCartCount(0);
    setCheckoutUrl(null);
    setCartLines([]);
    setCartTotal('0');
  }, []);

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
          clearCart();
        }
      } catch {
        if (cancelled) return;
        clearCart();
      }
    })();
    return () => { cancelled = true; };
  }, [cartId, clearCart]);

  const fetchCartDetails = useCallback(async () => {
    const id = localStorage.getItem(CART_KEY);
    if (!id) return;
    try {
      const { data } = await shopifyFetch(GET_CART_DETAILS, { cartId: id });
      if (data?.cart) {
        setCartLines(mapEdgesToLines(data.cart.lines.edges));
        setCartTotal(Math.round(parseFloat(data.cart.cost.totalAmount.amount)).toString());
        setCheckoutUrl(data.cart.checkoutUrl);
        setCartCount(data.cart.totalQuantity);
      } else {
        clearCart();
      }
    } catch {
      clearCart();
    }
  }, [clearCart]);

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

  const openCart = useCallback(async () => {
    setIsCartOpen(true);
    if (localStorage.getItem(CART_KEY)) await fetchCartDetails();
  }, [fetchCartDetails]);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const applyCartResponse = useCallback((cart: {
    totalQuantity: number;
    cost: { totalAmount: { amount: string } };
    lines: { edges: Array<{ node: Record<string, unknown> }> };
  }) => {
    const lines = mapEdgesToLines(cart.lines.edges);
    setCartLines(lines);
    setCartTotal(Math.round(parseFloat(cart.cost.totalAmount.amount)).toString());
    setCartCount(cart.totalQuantity);
    if (cart.totalQuantity === 0) setCartLines([]);
  }, []);

  const removeLine = useCallback(async (lineId: string) => {
    const id = localStorage.getItem(CART_KEY);
    if (!id) return;
    const { data } = await shopifyFetch(CART_LINES_REMOVE, {
      cartId: id,
      lineIds: [lineId],
    });
    const cart = data?.cartLinesRemove?.cart;
    if (cart) applyCartResponse(cart);
  }, [applyCartResponse]);

  const updateQuantity = useCallback(async (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeLine(lineId);
      return;
    }
    const id = localStorage.getItem(CART_KEY);
    if (!id) return;
    const { data } = await shopifyFetch(CART_LINES_UPDATE, {
      cartId: id,
      lines: [{ id: lineId, quantity: newQuantity }],
    });
    const cart = data?.cartLinesUpdate?.cart;
    if (cart) applyCartResponse(cart);
  }, [applyCartResponse, removeLine]);

  const clearLastAdded = useCallback(() => setLastAdded(null), []);

  return {
    cartCount, isLoading, lastAdded, addToCart, openCheckout, clearLastAdded,
    cartLines, cartTotal, isCartOpen, openCart, closeCart, updateQuantity, removeLine,
  };
}
