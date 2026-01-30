import React, { createContext, useContext, useEffect, useState } from "react";

interface CustomAddition {
  item: {
    id: string;
    name: string;
    price: number;
  };
  qty: number;
}

interface CustomBouquet {
  base: {
    id: string;
    name: string;
    price: number;
  };
  ribbon?: {
    id: string;
    name: string;
    price: number;
  };
  additions: CustomAddition[];
}

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  custom?: CustomBouquet;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;

  removeCustomAddition: (cartId: string, additionId: string) => void;
  incrementCustomAddition: (cartId: string, additionId: string) => void;
  decrementCustomAddition: (cartId: string, additionId: string) => void;

  totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  // Save
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // ---------- NORMAL PRODUCTS ----------
  const addToCart = (item) => {
    setItems((prev) => {
      const found = prev.find((i) => i._id === item._id);

      if (found) {
        return prev.map((i) =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + item.quantity } // ✅ use qty
            : i,
        );
      }

      return [...prev, item]; // ✅ keep passed quantity
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      ),
    );
  };

  // ---------- CUSTOM BOUQUET CONTROLS ----------
  const removeCustomAddition = (cartId: string, additionId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._id !== cartId || !item.custom) return item;

        const updated = item.custom.additions.filter(
          (a) => a.item.id !== additionId,
        );

        return recalcCustom(item, updated);
      }),
    );
  };

  const incrementCustomAddition = (cartId: string, additionId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._id !== cartId || !item.custom) return item;

        const updated = item.custom.additions.map((a) =>
          a.item.id === additionId ? { ...a, qty: a.qty + 1 } : a,
        );

        return recalcCustom(item, updated);
      }),
    );
  };

  const decrementCustomAddition = (cartId: string, additionId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._id !== cartId || !item.custom) return item;

        const updated = item.custom.additions
          .map((a) => (a.item.id === additionId ? { ...a, qty: a.qty - 1 } : a))
          .filter((a) => a.qty > 0);

        return recalcCustom(item, updated);
      }),
    );
  };

  const recalcCustom = (
    item: CartItem,
    additions: CustomAddition[],
  ): CartItem => {
    const newPrice =
      item.custom!.base.price +
      (item.custom!.ribbon?.price || 0) +
      additions.reduce((s, x) => s + x.item.price * x.qty, 0);

    return {
      ...item,
      price: newPrice,
      custom: {
        ...item.custom!,
        additions,
      },
    };
  };

  // ---------- TOTAL COUNT ----------
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQty,
        removeCustomAddition,
        incrementCustomAddition,
        decrementCustomAddition,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
