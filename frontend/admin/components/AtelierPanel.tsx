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

  /* ================= FETCH FLOWERS ================= */

  const fetchFlowers = async () => {
    const res = await axios.get(`${API}/product/Flowers`);
    setFlowerProducts(res.data);
  };

  /* ================= FETCH CHOCOLATES ================= */

  const fetchChocolates = async () => {
    const res = await axios.get(`${API}/product/Chocolate`);
    setChocolateProducts(res.data);
  };

  useEffect(() => {
    if (token) {
      fetchBouquetItems();
      fetchFlowers();
      fetchChocolates();
    }
  }, [token]);

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

  const toggleItem = async (item: BouquetItem) => {
    try {
      if (items.find((i) => i.id === item.id)) {
        await axios.patch(
          `${API}/custom-bouquet/${item.id}/toggle`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          `${API}/custom-bouquet`,
          {
            type: item.type,
            productId: item.product!._id,
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
        />

        {/* ================= FLOWERS ================= */}
        <Section
          title="Flowers"
          items={flowerProducts.map((p) => {
            const existing = bouquetByProductId(p._id);

            return (
              existing || {
                id: p._id,
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

        {/* ================= CHOCOLATES ================= */}
        <Section
          title="Chocolates"
          items={chocolateProducts.map((p) => {
            const existing = bouquetByProductId(p._id);

            return (
              existing || {
                id: p._id,
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
        />
      </div>
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
}: any) => (
  <div className="mb-10">
    <h3 className="text-sm font-bold uppercase mb-4">{title}</h3>

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
              className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-white border"
            >
              {item.isActive ? "Disable" : "Enable"}
            </button>

            {item.id && (
              <button
                onClick={() => deleteItem(item.id)}
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
