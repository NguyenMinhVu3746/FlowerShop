/**
 * CUSTOM HOOKS - useCart
 * =======================
 * Convenient hook to access cart state
 */

import { useCartStore } from '../stores';

export function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getItemByVariantId = useCartStore((state) => state.getItemByVariantId);
  
  // Calculate totals from items directly to ensure reactivity
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    getItemByVariantId,
  };
}
