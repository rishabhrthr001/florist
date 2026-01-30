import { AnimatePresence, motion } from "framer-motion";
import { X, ImagePlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Category } from "../../types";
import React from "react";
import axios from "axios";
import { toast } from "sonner";
import API from "../../config";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;

  onCreate: (category: Category) => void;
  onUpdate: (category: Category) => void;

  initialData?: Category | null;
}

const CategoryModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData,
}: CategoryModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    name: string;
    imageFile: File | null;
    imagePreview: string;
  }>({
    name: "",
    imageFile: null,
    imagePreview: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Prefill on edit */
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        imageFile: null,
        imagePreview: initialData.image,
      });
    } else {
      setFormData({
        name: "",
        imageFile: null,
        imagePreview: "",
      });
    }
  }, [initialData]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setFormData({
      ...formData,
      imageFile: file,
      imagePreview: previewUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("name", formData.name);

      if (formData.imageFile) {
        payload.append("image", formData.imageFile);
      }

      if (initialData) {
        const { data } = await axios.put(
          `${API}/category/${initialData._id}`,
          payload,
        );

        toast.success("Category updated");

        onUpdate(data);
      } else {
        const { data } = await axios.post(`${API}/category/add`, payload);

        toast.success("Category created");

        onCreate(data);
      }

      if (formData.imagePreview) {
        URL.revokeObjectURL(formData.imagePreview);
      }

      setFormData({
        name: "",
        imageFile: null,
        imagePreview: "",
      });

      onClose();
    } catch (err: any) {
      console.error(err);

      toast.error(err?.response?.data?.msg || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {initialData ? "Edit Category" : "Create Category"}
              </h2>

              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              {/* Name */}
              <input
                required
                placeholder="Category Name"
                className="w-full p-4 border rounded-xl text-sm"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
              />

              {/* Upload Box */}
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">
                  Category Image
                </p>

                <div
                  onClick={handleFileSelect}
                  className="relative cursor-pointer border-2 border-dashed border-gray-300 rounded-2xl h-44 flex items-center justify-center text-gray-400 hover:border-[#F8BBD0] hover:text-[#F8BBD0] transition-all overflow-hidden group"
                >
                  {!formData.imagePreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus size={28} />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Click to upload
                      </p>
                    </div>
                  ) : (
                    <img
                      src={formData.imagePreview}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Preview"
                    />
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#F8BBD0] transition-colors disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : initialData
                    ? "Update Category"
                    : "Add to Boutique"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;
