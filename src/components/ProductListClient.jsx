import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import Cart from './Cart';

const STORAGE_KEY = 'jnw-cart-v1';

export default function ProductListClient({ products = [] }) {
  const [cart, setCart] = useState([]);
  const [checkoutState, setCheckoutState] = useState('idle');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(variant, product) {
    setCart((current) => {
      const index = current.findIndex((item) => item.variantId === variant.id);
      if (index === -1) {
        return [
          ...current,
          { variantId: variant.id, qty: 1, title: product.title, variantTitle: variant.title },
        ];
      }
      return current.map((item, idx) => (idx === index ? { ...item, qty: item.qty + 1 } : item));
    });
  }

  function increment(variantId) {
    setCart((current) =>
      current.map((item) => (item.variantId === variantId ? { ...item, qty: item.qty + 1 } : item)),
    );
  }

  function decrement(variantId) {
    setCart((current) =>
      current
        .map((item) => (item.variantId === variantId ? { ...item, qty: Math.max(0, item.qty - 1) } : item))
        .filter((item) => item.qty > 0),
    );
  }

  async function checkout() {
    if (!cart.length) return;
    setCheckoutState('loading');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineItems: cart }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Checkout failed');
      if (json.webUrl) window.location.href = json.webUrl;
    } catch (error) {
      console.error(error);
      setCheckoutState('error');
      alert('Unable to start checkout right now.');
    } finally {
      setCheckoutState('idle');
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
      <Cart cart={cart} onIncrement={increment} onDecrement={decrement} onCheckout={checkout} checkoutState={checkoutState} />
    </section>
  );
}
