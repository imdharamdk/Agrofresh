import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const storageKey = 'agrofresh-cart';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, cartQty: Math.min(item.cartQty + qty, product.quantity || item.quantity || 999) }
            : item
        );
      }

      return [...prev, { ...product, cartQty: qty }];
    });
  };

  const removeFromCart = (_id) => setItems((prev) => prev.filter((item) => item._id !== _id));
  const updateQty = (_id, qty) => setItems((prev) => prev.map((item) => (item._id === _id ? { ...item, cartQty: qty } : item)));
  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.cartQty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.cartQty * item.price, 0);
    return { count, subtotal };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, ...totals }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
