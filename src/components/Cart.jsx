import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart({ cart, onIncrement, onDecrement, onCheckout, checkoutState }) {
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  return (
    <aside className="gold-outline rounded-md bg-black/70 p-4 backdrop-blur">
      <h2 className="text-2xl">Cart</h2>
      <p className="font-sans text-xs uppercase tracking-widest text-amber-100/60">{totalItems} items selected</p>

      <AnimatePresence mode="popLayout">
        {cart.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 font-sans text-sm text-amber-100/70"
          >
            Your cart is empty.
          </motion.p>
        ) : (
          <motion.ul key="list" className="mt-3 space-y-3">
            {cart.map((item) => (
              <motion.li layout key={item.variantId} className="rounded border border-amber-200/20 p-3 font-sans">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-amber-50">{item.title}</p>
                    <p className="text-xs text-amber-200/70">{item.variantTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => onDecrement(item.variantId)} className="px-2 py-1 text-amber-300">−</button>
                    <span className="text-sm">{item.qty}</span>
                    <button type="button" onClick={() => onIncrement(item.variantId)} className="px-2 py-1 text-amber-300">+</button>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        type="button"
        disabled={!cart.length || checkoutState === 'loading'}
        onClick={onCheckout}
        className="mt-4 w-full bg-amber-300 px-4 py-2 font-sans text-sm font-semibold uppercase tracking-wide text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {checkoutState === 'loading' ? 'Redirecting...' : 'Checkout'}
      </button>
    </aside>
  );
}
