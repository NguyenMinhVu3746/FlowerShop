/**
 * CART STORE - Zustand
 * =====================
 * Manages shopping cart state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, ProductSize } from '@/types';

interface CartState {
  items: CartItem[];
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemByVariantId: (variantId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Add item to cart
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.variantId === item.variantId);

        if (existingItem) {
          // Update quantity
          set({
            items: items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          // Add new item
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }],
          });
        }
      },

      // Remove item from cart
      removeItem: (variantId) => {
        set({
          items: get().items.filter((i) => i.variantId !== variantId),
        });
      },

      // Update quantity
      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        });
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] });
      },

      // Get total items count
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get total price
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      // Get item by variant ID
      getItemByVariantId: (variantId) => {
        return get().items.find((i) => i.variantId === variantId);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
