import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import React from "react";
import { ComponentItem } from "../../types";

interface AtelierPanelProps {
  items?: ComponentItem[];
  setItems: React.Dispatch<React.SetStateAction<ComponentItem[]>>;
}

/**
 * Defensive: items default to []
 * so filter/map never crash.
 */
const AtelierPanel = ({ items = [], setItems }: AtelierPanelProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    price: string;
    type: ComponentItem["type"];
  }>({
    name: "",
    price: "",
    type: "base",
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: ComponentItem = {
      id: `ci${Date.now()}`,
      name: formData.name,
      price: parseInt(formData.price),
      type: formData.type,
      image:
        "https://images.unsplash.com/photo-1596435033235-94770e28e08d?auto=format&fit=crop&q=80&w=400",
    };

    setItems([...items, newItem]);

    setIsModalOpen(false);
    setFormData({
      name: "",
      price: "",
      type: "base",
    });
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <>
      <div className="bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[#E5E5E5] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div>
            <h2 className="text-base md:text-lg font-bold">
              Bouquet Customizer
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              Manage bases, flowers, and additions
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#F8BBD0] transition-all"
          >
            <Plus size={16} /> Add Atelier Item
          </button>
        </div>

        {/* Items */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["base", "flower", "chocolate", "ribbon"].map((type) => (
              <div key={type} className="space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#F8BBD0] border-b pb-2">
                  {type}s
                </h3>

                <div className="space-y-3">
                  {items
                    .filter((i) => i.type === type)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl group"
                      >
                        <img
                          src={item.image}
                          className="w-10 h-10 rounded-lg object-cover"
                          alt=""
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">
                            ₹{item.price}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-serif text-2xl font-bold">
                  New Atelier Item
                </h2>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <form
                onSubmit={handleAddItem}
                className="p-8 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar"
              >
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                    Component Name
                  </label>

                  <input
                    required
                    placeholder="e.g. Silk Box"
                    className="w-full p-4 border rounded-xl text-sm"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                      Price (₹)
                    </label>

                    <input
                      required
                      type="number"
                      placeholder="500"
                      className="w-full p-4 border rounded-xl text-sm"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">
                      Type
                    </label>

                    <select
                      className="w-full p-4 border rounded-xl text-sm appearance-none"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as ComponentItem["type"],
                        })
                      }
                    >
                      <option value="base">Base</option>
                      <option value="flower">Flower</option>
                      <option value="chocolate">Chocolate</option>
                      <option value="ribbon">Ribbon</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#F8BBD0] transition-colors mt-4"
                >
                  Add to Atelier
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AtelierPanel;
