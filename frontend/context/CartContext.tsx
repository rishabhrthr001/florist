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

  message?: string;
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

  updateCustomMessage: (cartId: string, message: string) => void;

  clearCart: () => void;

  // ✅ SPECIAL REQUEST
  specialRequest: string;
  setSpecialRequest: React.Dispatch<React.SetStateAction<string>>;

  // ✅ DELIVERY PREFERENCES
  deliveryOption: "standard" | "scheduled";
  setDeliveryOption: React.Dispatch<React.SetStateAction<"standard" | "scheduled">>;
  deliveryDate: string;
  setDeliveryDate: React.Dispatch<React.SetStateAction<string>>;
  deliveryTime: string;
  setDeliveryTime: React.Dispatch<React.SetStateAction<string>>;

  totalItems: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
        return parsed.items || [];
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [specialRequest, setSpecialRequest] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return parsed.specialRequest || "";
      }
    } catch (e) {
      console.error(e);
    }
    return "";
  });

  const [deliveryOption, setDeliveryOption] = useState<"standard" | "scheduled">(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.deliveryOption || "standard";
      }
    } catch (e) {}
    return "standard";
  });

  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.deliveryDate || "";
      }
    } catch (e) {}
    return "";
  });

  const [deliveryTime, setDeliveryTime] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.deliveryTime || "10:00 AM - 11:00 AM";
      }
    } catch (e) {}
    return "10:00 AM - 11:00 AM";
  });

  /* ---------------- SAVE ---------------- */

  useEffect(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify({
        items,
        specialRequest,
        deliveryOption,
        deliveryDate,
        deliveryTime,
      }),
    );
  }, [items, specialRequest, deliveryOption, deliveryDate, deliveryTime]);

  /* ---------------- CLEAR CART ---------------- */

  const clearCart = () => {
    setItems([]);
    setSpecialRequest("");
    setDeliveryOption("standard");
    setDeliveryDate("");
    setDeliveryTime("10:00 AM - 11:00 AM");
    localStorage.removeItem("cart");
  };

  /* ---------------- ADD TO CART ---------------- */

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      if (item.custom) {
        return [...prev, item];
      }

      const found = prev.find((i) => i._id === item._id && !i.custom);

      if (found) {
        return prev.map((i) =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }

      return [...prev, item];
    });
  };

  /* ---------------- REMOVE ---------------- */

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  /* ---------------- UPDATE QTY ---------------- */

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
      ),
    );
  };

  /* ---------------- CUSTOM ADDITIONS ---------------- */

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

  /* ---------------- UPDATE MESSAGE ---------------- */

  const updateCustomMessage = (cartId: string, message: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item._id !== cartId || !item.custom) return item;

        return {
          ...item,
          custom: {
            ...item.custom,
            message,
          },
        };
      }),
    );
  };

  /* ---------------- RECALC PRICE ---------------- */

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

  /* ---------------- TOTAL ---------------- */

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        specialRequest,
        setSpecialRequest,
        deliveryOption,
        setDeliveryOption,
        deliveryDate,
        setDeliveryDate,
        deliveryTime,
        setDeliveryTime,
        addToCart,
        removeFromCart,
        updateQty,
        removeCustomAddition,
        incrementCustomAddition,
        decrementCustomAddition,
        updateCustomMessage,
        clearCart,
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
