import { useEffect, useState } from "react";
import axios from "axios";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import API from "../../config";

/* ---------------- TYPES ---------------- */

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  categoryId: Category;
}

interface Slot {
  position: number;
  product?: Product;
}

/* ---------------- COMPONENT ---------------- */

const PickTheirFav = () => {
  const [slots, setSlots] = useState<Slot[]>([
    { position: 1 },
    { position: 2 },
    { position: 3 },
    { position: 4 },
  ]);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(false);

  /* ---------------- FETCH CURRENT SEASONAL ---------------- */

  const fetchSeasonal = async () => {
    try {
      const { data } = await axios.get(
        `${API}/home-section/pick-their-fav`,
      );

      if (data?.items?.length) {
        const mapped = [1, 2, 3, 4].map((pos) => {
          const found = data.items.find((i: any) => i.position === pos);

          return {
            position: pos,
            product: found?.productId,
          };
        });

        setSlots(mapped);
      }
    } catch {
      toast.error("Failed to load pick their fav");
    }
  };

  useEffect(() => {
    fetchSeasonal();
  }, []);

  /* ---------------- OPEN PICKER ---------------- */

  const openPicker = async (slot: number) => {
    try {
      setActiveSlot(slot);
      setIsPickerOpen(true);
      setLoadingProducts(true);

      const { data } = await axios.get(`${API}/product`);

      setAllProducts(data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  /* ---------------- SELECT PRODUCT ---------------- */

  const selectProduct = (product: Product) => {
    setSlots((prev) =>
      prev.map((s) => (s.position === activeSlot ? { ...s, product } : s)),
    );

    setIsPickerOpen(false);
    setActiveSlot(null);

    toast.success("Pick their fav product assigned");
  };

  /* ---------------- FILTER ---------------- */

  const filtered = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryId?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  /* ---------------- SAVE ---------------- */

  const saveSeasonal = async () => {
    try {
      const payload = slots.map((s) => ({
        position: s.position,
        productId: s.product?._id,
      }));

      if (payload.some((p) => !p.productId)) {
        toast.error("All 4 slots must be filled");
        return;
      }

      await axios.put(`${API}/home-section/pick-their-fav`, {
        items: payload,
      });

      toast.success("Pick their fav updated");
      fetchSeasonal();
    } catch {
      toast.error("Save failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* GRID */}
      <div className="bg-white p-6 rounded-3xl border border-[#E5E5E5]">
        <div className="flex justify-between mb-6">
          <p className="text-sm text-gray-500">
            Select 4 favorite flower products.
          </p>

          <button
            onClick={saveSeasonal}
            className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#F8BBD0]"
          >
            Save Changes
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {slots.map((slot) => (
            <div
              key={slot.position}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden border group"
            >
              {slot.product ? (
                <>
                  <img
                    src={slot.product.images[0]}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                    <p className="font-serif text-3xl">#{slot.position}</p>
                    <p className="text-xs uppercase font-bold">
                      {slot.product.name}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  Slot {slot.position}
                </div>
              )}

              <button
                onClick={() => openPicker(slot.position)}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white px-5 py-2 rounded-full text-[10px] font-bold uppercase shadow hover:bg-[#F8BBD0]"
              >
                Change
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- PICKER MODAL ---------------- */}

      <AnimatePresence>
        {isPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 flex justify-center items-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-5xl p-8 relative"
            >
              <button
                onClick={() => setIsPickerOpen(false)}
                className="absolute top-5 right-5"
              >
                <X />
              </button>

              <h2 className="font-serif text-2xl mb-6">
                Select Pick Their Fav Product
              </h2>

              {/* SEARCH */}
              <div className="relative mb-6">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product or category..."
                  className="w-full border rounded-full pl-10 pr-4 py-3 text-sm"
                />
              </div>

              {/* GRID */}
              {loadingProducts ? (
                <p className="text-gray-400">Loading…</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto">
                  {filtered.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => selectProduct(p)}
                      className="text-left group"
                    >
                      <div className="aspect-[4/5] rounded-xl overflow-hidden border">
                        <img
                          src={p.images[0]}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <p className="mt-2 text-xs font-bold truncate">
                        {p.name}
                      </p>

                      <p className="text-[10px] text-gray-400">
                        {p.categoryId?.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PickTheirFav;
