import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import axios from "axios";
import React from "react";
import { toast } from "sonner";
import API from "../../config";
import { Product, Category } from "../../types";
import ProductModal from "../components/ProductModal";

const ProductPanel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  /* -----------------------------------
        FETCH CATEGORIES
  ----------------------------------- */
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API}/category`);
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  /* -----------------------------------
        FETCH PRODUCTS
  ----------------------------------- */
  const fetchProducts = async (categoryId?: string) => {
    try {
      setLoading(true);

      const url =
        categoryId && categoryId !== "all"
          ? `${API}/product?categoryId=${categoryId}`
          : `${API}/product`;

      const { data } = await axios.get(url);

      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------
        INIT LOAD
  ----------------------------------- */
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  /* -----------------------------------
        FILTER CHANGE
  ----------------------------------- */
  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    fetchProducts(id);
  };

  /* -----------------------------------
        DELETE PRODUCT
  ----------------------------------- */
  const deleteProduct = async (id: string) => {
    try {
      await axios.delete(`${API}/product/${id}`);

      setProducts((prev) => prev.filter((p) => p._id !== id));

      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* -----------------------------------
        EDIT
  ----------------------------------- */

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
    fetchProducts(selectedCategory);
  };

  return (
    <>
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E5E5] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h2 className="text-lg font-bold">Catalog Management</h2>

          <div className="flex gap-4">
            {/* CATEGORY FILTER */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-widest"
            >
              <option value="all">All Categories</option>

              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* ADD */}
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#F8BBD0]"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-8 text-gray-400">Loading products...</p>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 text-[9px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="px-8 py-4 text-left">Product</th>
                  <th className="px-8 py-4 text-left">Price</th>
                  <th className="px-8 py-4 text-left">Description</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]}
                          className="w-12 h-12 rounded-lg object-cover"
                        />

                        <p className="text-sm font-semibold">{p.name}</p>
                      </div>
                    </td>

                    <td className="px-8 py-4 font-medium">₹{p.price}</td>

                    <td className="px-8 py-4 text-xs text-gray-500 max-w-[240px] truncate">
                      {p.description}
                    </td>

                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-gray-400 hover:text-black"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        product={editingProduct}
        mode={editingProduct ? "edit" : "add"}
      />
    </>
  );
};

export default ProductPanel;
