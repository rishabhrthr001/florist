import { AnimatePresence, motion } from "framer-motion";
import { X, ImagePlus, Plus, Edit, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import API from "../../config";

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  categoryId: any;
  images: string[];
  tags?: string[];
  premiumWrapping?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  product?: Product | null;
  mode: "add" | "edit";
}

const MAX_IMAGES = 3;

const ProductModal = ({
  isOpen,
  onClose,
  title,
  product,
  mode,
}: ModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState("");

  const [imageSlots, setImageSlots] = useState<{ url: string | null; file: File | null }[]>([
    { url: null, file: null },
    { url: null, file: null },
    { url: null, file: null },
  ]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    tags: "",
    premiumWrapping: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);

  /* ----------------------------------
        LOAD DROPDOWNS
  ---------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    const fetchDropdowns = async () => {
      try {
        const [catRes, tagsRes] = await Promise.all([
          axios.get(`${API}/category`),
          axios.get(`${API}/tag`), // Fetching specialized tags
        ]);
        
        setCategories(catRes.data);
        
        // Use database tags exclusively
        setAvailableTags(tagsRes.data.map((t: any) => t.slug));
      } catch {
        toast.error("Failed to load options");
      }
    };

    fetchDropdowns();
  }, [isOpen]);

  /* ----------------------------------
        PREFILL WHEN EDITING
  ---------------------------------- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && product) {
      setForm({
        name: product.name || "",
        price: String(product.price || ""),
        description: product.description || "",
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : (typeof product.tags === "string" ? product.tags : ""),
        premiumWrapping: product.premiumWrapping || false,
      });

      setSelectedCategory(
        product.categoryId 
          ? (typeof product.categoryId === "object" ? product.categoryId._id : product.categoryId)
          : ""
      );

      // Map existing images to slots
      const initialSlots = [
        { url: product.images?.[0] || null, file: null },
        { url: product.images?.[1] || null, file: null },
        { url: product.images?.[2] || null, file: null },
      ];
      setImageSlots(initialSlots);
    }

    if (mode === "add") {
      setForm({
        name: "",
        price: "",
        description: "",
        tags: "",
        premiumWrapping: false,
      });

      setImageSlots([
        { url: null, file: null },
        { url: null, file: null },
        { url: null, file: null },
      ]);
    }
  }, [isOpen, mode, product]);

  /* ----------------------------------
        IMAGE PICKER
  ---------------------------------- */
  const openFilePicker = (index: number) => {
    setActiveSlot(index);
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected || activeSlot === null) return;

    const newUrl = URL.createObjectURL(selected);
    
    setImageSlots(prev => {
      const next = [...prev];
      // Revoke old blob if exists
      if (next[activeSlot].url?.startsWith("blob:")) {
        URL.revokeObjectURL(next[activeSlot].url!);
      }
      next[activeSlot] = { url: newUrl, file: selected };
      return next;
    });

    e.target.value = "";
    setActiveSlot(null);
  };

  const removeImage = (index: number) => {
    setImageSlots(prev => {
      const next = [...prev];
      if (next[index].url?.startsWith("blob:")) {
        URL.revokeObjectURL(next[index].url!);
      }
      next[index] = { url: null, file: null };
      return next;
    });
  };

  /* ----------------------------------
        SUBMIT
  ---------------------------------- */
  const handlePublish = async () => {
    if (!form.name || !form.price || !selectedCategory) {
      toast.error("Fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("price", form.price);
      payload.append("description", form.description);
      payload.append("categoryId", selectedCategory);
      payload.append("premiumWrapping", String(form.premiumWrapping));

      const parsedTags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      payload.append("tags", JSON.stringify(parsedTags));

      // Handle positional images
      const existingUrls = imageSlots.map(s => s.file ? null : s.url);
      payload.append("existingImages", JSON.stringify(existingUrls));

      imageSlots.forEach((slot, idx) => {
        if (slot.file) {
          payload.append(`image${idx}`, slot.file);
        }
      });

      if (mode === "add") {
        await axios.post(`${API}/product/add`, payload);
        toast.success("Product created");
      } else if (mode === "edit" && product) {
        await axios.put(`${API}/product/${product._id}`, payload);
        toast.success("Product updated");
      }

      // Cleanup
      imageSlots.forEach(s => {
        if (s.url?.startsWith("blob:")) URL.revokeObjectURL(s.url);
      });

      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ----------------------------------
        UI
  ---------------------------------- */

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold">{title}</h2>

              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* NAME */}
              <input
                placeholder="Product Name"
                className="w-full p-4 border rounded-xl text-sm"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              {/* PRICE */}
              <input
                type="number"
                placeholder="Price ₹"
                className="w-full p-4 border rounded-xl text-sm"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
              />

              {/* DESC */}
              <textarea
                placeholder="Product Description"
                className="w-full p-4 border rounded-xl text-sm h-28 resize-none"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />

              <div className="relative">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">
                  Tags (Quick Links)
                </p>
                <div 
                  className="w-full min-h-[56px] p-2 border rounded-xl bg-white flex flex-wrap gap-2 items-center cursor-text"
                  onClick={() => setTagsDropdownOpen(true)}
                >
                  {(form.tags || "").split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-medium">
                      {tag}
                      <X 
                        size={12} 
                        className="cursor-pointer hover:text-pink-900" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const newTags = (form.tags || "").split(",").map(t => t.trim()).filter(t => t && t !== tag);
                          setForm({ ...form, tags: newTags.join(", ") });
                        }} 
                      />
                    </span>
                  ))}
                  <input
                    placeholder={form.tags ? "" : "Select or type tags..."}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm p-2"
                    value="" 
                    readOnly
                  />
                </div>

                <AnimatePresence>
                  {tagsDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setTagsDropdownOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-xl max-h-48 overflow-y-auto p-2 flex flex-wrap gap-2"
                      >
                        {availableTags.map(tag => {
                          const currentTags = (form.tags || "").split(",").map(t => t.trim()).filter(Boolean);
                          const isSelected = currentTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={(e) => {
                                e.preventDefault();
                                if (isSelected) {
                                  setForm({ ...form, tags: currentTags.filter(t => t !== tag).join(", ") });
                                } else {
                                  setForm({ ...form, tags: [...currentTags, tag].join(", ") });
                                }
                              }}
                              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${isSelected ? 'bg-pink-500 text-white border-pink-500' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'}`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* CATEGORY */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-4 border rounded-xl bg-white text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* PREMIUM WRAPPING TOGGLE */}
              <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50">
                <div>
                  <p className="text-sm font-bold text-gray-900">Premium Wrapping</p>
                  <p className="text-[10px] text-gray-500 uppercase font-medium mt-0.5">Complementary Gift Packaging</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, premiumWrapping: !form.premiumWrapping })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.premiumWrapping ? 'bg-[#EE1C47]' : 'bg-gray-200'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.premiumWrapping ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {/* IMAGE UPLOADER */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] uppercase font-bold text-gray-400">
                    Product Images (Max 3)
                  </p>
                  <p className="text-[9px] text-gray-400 italic">
                    Images are saved in order (Left to Right)
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 h-32">
                  {imageSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="relative group rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden transition-all hover:border-[#F8BBD0]"
                    >
                      {slot.url ? (
                        <>
                          <img
                            src={slot.url}
                            className="w-full h-full object-cover"
                            alt={`Slot ${index + 1}`}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => openFilePicker(index)}
                              className="bg-white p-1.5 rounded-full shadow-lg mx-1 text-gray-700 hover:text-black"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-white p-1.5 rounded-full shadow-lg mx-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openFilePicker(index)}
                          className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#F8BBD0] transition-colors"
                        >
                          <ImagePlus size={20} />
                          <span className="text-[8px] font-bold uppercase tracking-tighter">
                            Slot {index + 1}
                          </span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <input
                  ref={fileInputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleFilesSelected}
                />
              </div>

              {/* SUBMIT */}
              <button
                disabled={isSubmitting}
                onClick={handlePublish}
                className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#F8BBD0] disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "edit"
                    ? "Update Product"
                    : "Publish Product"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
