import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import API from "../config";

interface WishlistItem {
    _id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
}

interface WishlistContextType {
    items: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    clearWishlist: () => void;
    isInWishlist: (id: string) => boolean;
    totalItems: number;
    syncWishlist: (token: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    /* ---------------- LOAD FROM LOCALSTORAGE ---------------- */

    useEffect(() => {
        try {
            const stored = localStorage.getItem("wishlist");
            if (stored) setItems(JSON.parse(stored));

            // Check if user is logged in
            const authToken = localStorage.getItem("token");
            if (authToken) {
                setToken(authToken);
            }
        } catch (error) {
            console.error("Failed to load wishlist from localStorage:", error);
        }
    }, []);

    /* ---------------- SAVE TO LOCALSTORAGE ---------------- */

    useEffect(() => {
        try {
            localStorage.setItem("wishlist", JSON.stringify(items));
        } catch (error) {
            console.error("Failed to save wishlist to localStorage:", error);
        }
    }, [items]);

    /* ---------------- SYNC WITH BACKEND ---------------- */

    const syncWishlist = async (authToken: string) => {
        if (isSyncing) return;

        try {
            setIsSyncing(true);
            setToken(authToken);

            // Sync with backend (merge)
            const { data } = await axios.post(
                `${API}/wishlist/sync`,
                { items },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );

            // Convert backend format to frontend format
            const backendItems = data.map((item: any) => ({
                _id: item.productId,
                name: item.name,
                price: item.price,
                image: item.image,
                slug: item.slug,
            }));

            setItems(backendItems);
        } catch (error) {
            console.error("Failed to sync wishlist:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    /* ---------------- ADD TO WISHLIST ---------------- */

    const addToWishlist = async (item: WishlistItem) => {
        // Check if already exists
        const exists = items.find((i) => i._id === item._id);
        if (exists) return;

        // Add to local state immediately
        setItems((prev) => [...prev, item]);

        // Sync to backend if logged in
        if (token) {
            try {
                await axios.post(
                    `${API}/wishlist`,
                    {
                        productId: item._id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        slug: item.slug,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            } catch (error) {
                console.error("Failed to sync add to backend:", error);
            }
        }
    };

    /* ---------------- REMOVE FROM WISHLIST ---------------- */

    const removeFromWishlist = async (id: string) => {
        // Remove from local state immediately
        setItems((prev) => prev.filter((i) => i._id !== id));

        // Sync to backend if logged in
        if (token) {
            try {
                await axios.delete(`${API}/wishlist/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                console.error("Failed to sync remove to backend:", error);
            }
        }
    };

    /* ---------------- CLEAR WISHLIST ---------------- */

    const clearWishlist = async () => {
        setItems([]);
        localStorage.removeItem("wishlist");

        // Sync to backend if logged in
        if (token) {
            try {
                await axios.delete(`${API}/wishlist`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                console.error("Failed to sync clear to backend:", error);
            }
        }
    };

    /* ---------------- CHECK IF IN WISHLIST ---------------- */

    const isInWishlist = (id: string) => {
        return items.some((i) => i._id === id);
    };

    /* ---------------- TOTAL ITEMS ---------------- */

    const totalItems = items.length;

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                clearWishlist,
                isInWishlist,
                totalItems,
                syncWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
    return ctx;
};
