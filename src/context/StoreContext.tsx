'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type CartItem = {
  cartKey: string;
  productId: string;
  variantId?: string;
  name: string;
  variantLabel?: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  categoryId?: string;
  rating?: number;
  reviewCount?: number;
};

type AddItemInput = Omit<CartItem, 'cartKey' | 'quantity'> & { quantity?: number };

type StoreContextValue = {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: AddItemInput) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (id: string) => void;
  productFilter: string | null;
  setProductFilter: (id: string | null) => void;
  clearProductFilters: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function makeCartKey(productId: string, variantId?: string): string {
  return `${productId}-${variantId ?? productId}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productFilter, setProductFilter] = useState<string | null>(null);

  const clearProductFilters = () => {
    setCategoryFilter('all');
    setProductFilter(null);
  };

  const addItem = (item: AddItemInput) => {
    const cartKey = makeCartKey(item.productId, item.variantId);
    const quantity = item.quantity ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, cartKey, quantity }];
    });
  };

  const removeItem = (cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartKey);
      return;
    }
    setItems((prev) => prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value: StoreContextValue = {
    items,
    itemCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartOpen,
    setCartOpen,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    productFilter,
    setProductFilter,
    clearProductFilters,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
