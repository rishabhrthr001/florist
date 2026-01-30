import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import React from "react";

import { Category } from "../../types";
import CategoryModal from "./CategoryModal";
import { toast } from "sonner";
import API from "../../config";

const CategoryPanel = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/category`);

      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const removeCategory = async (id: string) => {
    try {
      await axios.delete(`${API}/category/${id}`);

      setCategories((prev) => prev.filter((c) => c._id !== id));

      toast.success("Category removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      {isLoading && (
        <p className="text-sm text-gray-400">Loading categories...</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white rounded-2xl md:rounded-3xl border border-[#E5E5E5] overflow-hidden group"
          >
            <div className="h-40 md:h-48 relative">
              <img
                src={cat.image}
                className="w-full h-full object-cover"
                alt={cat.name}
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingCategory(cat);
                    setIsModalOpen(true);
                  }}
                  className="bg-white p-2.5 rounded-full shadow-lg mx-1.5"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => removeCategory(cat._id)}
                  className="bg-white p-2.5 rounded-full shadow-lg mx-1.5"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <h3 className="text-base md:text-lg font-bold">{cat.name}</h3>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-[9px] font-bold text-[#F8BBD0] uppercase">
                  Active
                </span>

                <span className="text-[8px] bg-gray-100 px-2 py-1 rounded text-gray-400">
                  {cat.slug}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Add */}
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="border-2 border-dashed border-gray-200 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center py-10 md:py-12 text-gray-400 hover:bg-white hover:border-[#F8BBD0] transition-all group"
        >
          <Plus className="mb-2 group-hover:text-[#F8BBD0]" size={20} />

          <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest">
            New Category
          </span>
        </button>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
        onCreate={(created) => setCategories((prev) => [...prev, created])}
        onUpdate={(updated) =>
          setCategories((prev) =>
            prev.map((c) => (c._id === updated._id ? updated : c)),
          )
        }
      />
    </>
  );
};

export default CategoryPanel;
