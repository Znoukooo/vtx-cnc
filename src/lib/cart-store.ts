import { create } from 'zustand';

export interface CartItem {
  id: string; // ID unik kombinasi: product.id + varian
  productId: string;
  name: string;
  price: number;
  brand: string;
  imageUrl: string;
  quantity: number;
  color?: string;
  motor?: string;
  discSize?: string;
  selected?: boolean;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'selected'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (select: boolean) => void;
  clearCart: () => void;
  clearSelectedItems: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (itemToAdd) =>
    set((state) => {
      // Cek apakah item dengan varian yang sama sudah ada di keranjang
      const existing = state.items.find((item) => item.id === itemToAdd.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === itemToAdd.id
              ? { ...item, quantity: item.quantity + itemToAdd.quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, { ...itemToAdd, selected: true }] };
    }),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  updateQuantity: (id, delta) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      }),
    })),
  toggleSelect: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ),
    })),
  toggleSelectAll: (select) =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, selected: select })),
    })),
  clearCart: () => set({ items: [] }),
  clearSelectedItems: () =>
    set((state) => ({ items: state.items.filter((item) => !item.selected) })),
}));