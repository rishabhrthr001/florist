import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const Wishlist: React.FC = () => {
    const { items, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (item: any) => {
        addToCart({
            _id: item._id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
        });
        removeFromWishlist(item._id);
        toast.success(`${item.name} moved to cart 🛒`);
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6">
                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Heart size={32} className="text-[#F8BBD0]" fill="#F8BBD0" />
                        <h1 className="font-serif text-4xl md:text-5xl">My Wishlist</h1>
                    </div>
                    <p className="text-gray-500 text-sm">
                        {items.length > 0
                            ? `You have ${items.length} ${items.length === 1 ? "item" : "items"} in your wishlist`
                            : "Your wishlist is empty"}
                    </p>
                </motion.div>

                {/* EMPTY STATE */}
                {items.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-[3rem] shadow-lg p-20 text-center"
                    >
                        <Heart
                            size={64}
                            className="mx-auto mb-6 text-gray-200"
                            strokeWidth={1}
                        />
                        <h2 className="font-serif text-2xl mb-3 text-gray-400">
                            Your wishlist is waiting
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Add items you love to your wishlist and never lose track of them!
                        </p>
                        <Link
                            to="/explore"
                            className="inline-flex items-center gap-2 bg-[#F8BBD0] text-white px-8 py-4 rounded-full hover:bg-[#f797b9] transition"
                        >
                            Start Shopping
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                )}

                {/* WISHLIST GRID */}
                {items.length > 0 && (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-3xl shadow-lg overflow-hidden group"
                                >
                                    {/* IMAGE */}
                                    <Link
                                        to={`/product/${item.slug}`}
                                        className="block relative aspect-[4/5] overflow-hidden bg-[#F5F5F5]"
                                    >
                                        <motion.img
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ duration: 0.6 }}
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* REMOVE BUTTON */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeFromWishlist(item._id);
                                                toast.success("Removed from wishlist 💔");
                                            }}
                                            className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </Link>

                                    {/* INFO */}
                                    <div className="p-5">
                                        <Link to={`/product/${item.slug}`}>
                                            <h3 className="font-serif text-base mb-1 hover:text-[#F8BBD0] transition-colors line-clamp-1">
                                                {item.name}
                                            </h3>
                                        </Link>

                                        <p className="font-bold text-lg mb-4">
                                            ₹{item.price.toLocaleString()}
                                        </p>

                                        {/* ACTIONS */}
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => {
                                                    addToCart({
                                                        _id: item._id,
                                                        name: item.name,
                                                        price: item.price,
                                                        image: item.image,
                                                        quantity: 1,
                                                    });
                                                    toast.success(`${item.name} added to cart 🛒`);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-xl hover:bg-gray-800 transition text-sm font-semibold"
                                            >
                                                <ShoppingBag size={16} />
                                                Add to Cart
                                            </button>
                                            <button
                                                onClick={() => handleMoveToCart(item)}
                                                className="w-full text-sm text-gray-600 hover:text-[#F8BBD0] transition"
                                            >
                                                Move to Cart & Remove
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* CONTINUE SHOPPING */}
                {items.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-12 text-center"
                    >
                        <Link
                            to="/explore"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#F8BBD0] transition"
                        >
                            <ArrowRight size={18} />
                            Continue Shopping
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
