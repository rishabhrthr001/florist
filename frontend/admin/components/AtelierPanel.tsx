import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X, Image as ImageIcon, Pencil } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import API from "@/config";
import { useAuth } from "@/context/AuthContext";

/* ---------------- TYPES ---------------- */

type BouquetType = "base" | "flower" | "chocolate" | "ribbon";

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
}

interface BouquetItem {
  id: string;
  type: BouquetType;
  isActive: boolean;

  name?: string;
  price?: number;
  image?: string;

  product?: Product;
}

/* ---------------- COMPONENT ---------------- */

const AtelierPanel = () => {
  const { token } = useAuth();

  const [items, setItems] = useState<BouquetItem[]>([]);

  const [flowerProducts, setFlowerProducts] = useState<Product[]>([]);
  const [chocolateProducts, setChocolateProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedFlowerTag, setSelectedFlowerTag] = useState<string>("roses");

  const FLOWER_TAGS = [
    "roses", "lilies", "sunflowers", "orchids", "carnations", "mixed", "exotic"
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BouquetItem | null>(null);

  const [formData, setFormData] = useState({
    type: "base" as BouquetType,
    name: "",
    price: "",
    image: null as File | null,
    productId: "",
  });

  const [preview, setPreview] = useState<string | null>(null);

  /* ================= FETCH BOUQUET ================= */

  const fetchBouquetItems = async () => {
    const res = await axios.get(`${API}/custom-bouquet/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setItems(
      res.data.map((i: any) => ({
        ...i,
        id: i._id,
      })),
    );
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${API}/category`);
    setCategories(res.data);
  };

  /* ================= FETCH FLOWERS ================= */

  const fetchFlowers = async () => {
    if (!selectedFlowerTag) return;
    const res = await axios.get(`${API}/product?tag=${selectedFlowerTag}`);
    setFlowerProducts(res.data);
  };

  /* ================= FETCH CHOCOLATES ================= */

  const fetchChocolates = async () => {
    const chocCat = categories.find((c: any) => c.name.toLowerCase().includes('chocolat'));
    if (chocCat) {
      const res = await axios.get(`${API}/product?categoryId=${chocCat._id}`);
      setChocolateProducts(res.data);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBouquetItems();
      fetchCategories();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFlowers();
      fetchChocolates();
    }
  }, [selectedFlowerTag, categories, token]);

  /* ================= HELPERS ================= */

  const displayName = (item: BouquetItem) =>
    item.product?.name || item.name || "—";

  const displayPrice = (item: BouquetItem) =>
    item.product?.price || item.price || 0;

  const displayImage = (item: BouquetItem) =>
    item.product?.images?.[0] ||
    item.image ||
    "https://via.placeholder.com/200x200?text=No+Image";

  const bouquetByProductId = (pid: string) =>
    items.find((i) => i.product?._id === pid);

  /* ================= TOGGLE ================= */

  const toggleItem = async (item: BouquetItem | any) => {
    try {
      const existing = items.find((i) => i.product?._id === (item.product?._id || item._id));

      if (existing) {
        await axios.patch(
          `${API}/custom-bouquet/${existing.id || existing._id}/toggle`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        // Determine type based on category name if possible
        const prod = item.product || item;
        let itemType = item.type || "flower";
        
        if (prod.categoryId) {
           const cat = categories.find(c => c._id === (prod.categoryId._id || prod.categoryId));
           if (cat?.name.toLowerCase().includes('chocolat')) itemType = "chocolate";
           else if (cat?.name.toLowerCase().includes('flower')) itemType = "flower";
        }

        await axios.post(
          `${API}/custom-bouquet`,
          {
            type: itemType,
            productId: prod._id,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      fetchBouquetItems();
    } catch (err) {
      console.error(err);
      toast.error("Toggle failed");
    }
  };

  /* ================= SUBMIT (CREATE/UPDATE) ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fData = new FormData();
      fData.append("type", formData.type);
      fData.append("name", formData.name);
      fData.append("price", formData.price);
      if (formData.image) fData.append("image", formData.image);

      if (editingItem) {
        await axios.put(`${API}/custom-bouquet/${editingItem.id}`, fData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Item updated");
      } else {
        await axios.post(`${API}/custom-bouquet`, fData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Item added");
      }

      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ type: "base", name: "", price: "", image: null, productId: "" });
      setPreview(null);
      fetchBouquetItems();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const deleteItem = async (id: string) => {
    toast("Delete this item?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          await axios.delete(`${API}/custom-bouquet/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          fetchBouquetItems();
        },
      },
    });
  };

  /* ================= UI ================= */

  return (
    <>
      <div className="bg-white rounded-3xl border shadow-sm p-6">
        <div className="flex justify-between mb-8">
          <h2 className="text-lg font-bold">Bouquet Customizer</h2>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase flex gap-2"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>

        {/* ================= BASES ================= */}
        <Section
          title="Bases"
          items={items.filter((i) => i.type === "base")}
          toggleItem={toggleItem}
          deleteItem={deleteItem}
          displayImage={displayImage}
          displayName={displayName}
          displayPrice={displayPrice}
          onEdit={(item: any) => {
             setEditingItem(item);
             setFormData({
                type: item.type,
                name: item.name || "",
                price: item.price?.toString() || "",
                image: null,
                productId: ""
             });
             setPreview(item.image);
             setIsModalOpen(true);
          }}
        />

        {/* ================= FLOWERS ================= */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase">Flowers</h3>
            
            <select 
              value={selectedFlowerTag}
              onChange={(e) => setSelectedFlowerTag(e.target.value)}
              className="px-4 py-2 bg-gray-50 border rounded-xl text-xs font-bold capitalize"
            >
              {FLOWER_TAGS.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <Section
            items={flowerProducts.map((p) => {
              const existing = bouquetByProductId(p._id);

              return (
                existing || {
                  id: p._id,
                  _id: p._id, // compatibility
                  type: "flower",
                  isActive: false,
                  product: p,
                }
              );
            })}
            toggleItem={toggleItem}
            deleteItem={deleteItem}
            displayImage={displayImage}
            displayName={displayName}
            displayPrice={displayPrice}
          />
        </div>

        {/* ================= CHOCOLATES ================= */}
        <Section
          title="Chocolates"
          items={chocolateProducts.map((p) => {
            const existing = bouquetByProductId(p._id);

            return (
              existing || {
                id: p._id,
                _id: p._id,
                type: "chocolate",
                isActive: false,
                product: p,
              }
            );
          })}
          toggleItem={toggleItem}
          deleteItem={deleteItem}
          displayImage={displayImage}
          displayName={displayName}
          displayPrice={displayPrice}
        />

        {/* ================= RIBBONS ================= */}
        <Section
          title="Ribbons"
          items={items.filter((i) => i.type === "ribbon")}
          toggleItem={toggleItem}
          deleteItem={deleteItem}
          displayImage={displayImage}
          displayName={displayName}
          displayPrice={displayPrice}
          onEdit={(item: any) => {
             setEditingItem(item);
             setFormData({
                type: item.type,
                name: item.name || "",
                price: item.price?.toString() || "",
                image: null,
                productId: ""
             });
             setPreview(item.image);
             setIsModalOpen(true);
          }}
        />
      </div>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">
                    {editingItem ? "Edit Item" : "Add New Item"}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingItem(null);
                      setPreview(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                      Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {["base", "ribbon"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, type: t as any }))}
                          className={`py-3 rounded-2xl text-xs font-bold uppercase border transition-all ${
                            formData.type === t 
                              ? "bg-black text-white border-black" 
                              : "bg-white text-gray-400 border-gray-100 hover:border-black"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                      Name
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:border-black"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                      Price (₹)
                    </label>
                    <input
                      required
                      type="number"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:border-black"
                      value={formData.price}
                      onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                      Image
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-dashed flex items-center justify-center overflow-hidden">
                        {preview ? (
                          <img src={preview} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-gray-300" size={32} strokeWidth={1} />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData((p) => ({ ...p, image: file }));
                            setPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-[#EE1C47] text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-red-100"
                  >
                    {loading ? "Processing..." : editingItem ? "Save Changes" : "Create Item"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AtelierPanel;

/* ================= SECTION ================= */

const Section = ({
  title,
  items,
  toggleItem,
  deleteItem,
  displayImage,
  displayName,
  displayPrice,
  onEdit,
}: any) => (
  <div className="mb-10">
    {title && <h3 className="text-sm font-bold uppercase mb-4">{title}</h3>}

    <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {items.map((item: BouquetItem) => (
        <div
          key={item.id}
          className={`p-3 rounded-xl border ${
            item.isActive
              ? "bg-green-50 border-green-400"
              : "bg-red-50 border-red-300"
          }`}
        >
          <img
            src={displayImage(item)}
            className="h-20 w-full object-cover rounded-lg mb-2"
          />

          <p className="font-semibold text-sm">{displayName(item)}</p>

          <p className="text-[11px] text-gray-500">₹{displayPrice(item)}</p>

          <div className="flex gap-1.5 mt-2">
            <button
              onClick={() => toggleItem(item)}
              className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border ${
                item.isActive ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"
              }`}
            >
              {item.isActive ? "Disable" : "Enable"}
            </button>

            {onEdit && (
               <button
                 onClick={() => onEdit(item)}
                 className="p-1.5 bg-white border rounded-lg text-gray-500"
               >
                 <Pencil size={12} />
               </button>
            )}

            {(item.id || (item as any)._id) && (
              <button
                onClick={() => deleteItem(item.id || (item as any)._id)}
                className="p-1.5 bg-white border rounded-lg text-red-500"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);
