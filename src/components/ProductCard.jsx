import React from 'react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAddToCart }) {
  const firstImage = product.images?.edges?.[0]?.node?.url;
  const firstVariant = product.variants?.edges?.[0]?.node;
  const fallbackImage =
    'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=900&q=80';

  return (
    <motion.article
      className="gold-outline overflow-hidden rounded-md bg-neutral-950 shadow-[0_10px_35px_rgba(0,0,0,0.55)]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.28 }}
    >
      <a href={`/product/${product.handle}`} className="block">
        <div className="aspect-[4/5] overflow-hidden bg-zinc-900">
          <motion.img
            src={firstImage || fallbackImage}
            alt={product.title}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.06, rotate: -0.4 }}
            transition={{ type: 'spring', stiffness: 150, damping: 17 }}
            loading="lazy"
          />
        </div>
      </a>
      <div className="space-y-2 p-4">
        <p className="font-sans text-[0.67rem] uppercase tracking-[0.22em] text-amber-200/70">JNW Collection</p>
        <a href={`/product/${product.handle}`}>
          <h3 className="line-clamp-2 text-xl leading-tight text-amber-50">{product.title}</h3>
        </a>
        <p className="font-sans text-sm text-amber-300">From R{firstVariant?.priceV2?.amount ?? '--'}</p>
        {firstVariant?.availableForSale ? (
          <button
            type="button"
            className="w-full bg-amber-300 px-4 py-2 font-sans text-sm font-medium uppercase tracking-wide text-black transition hover:bg-amber-200"
            onClick={() => onAddToCart(firstVariant, product)}
          >
            Add to cart
          </button>
        ) : (
          <span className="inline-block w-full border border-amber-300/40 px-4 py-2 text-center font-sans text-sm text-amber-200/80">
            Sold out
          </span>
        )}
      </div>
    </motion.article>
  );
}
