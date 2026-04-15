import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import axios from "axios";
import React from "react";
import { toast } from "sonner";
import API from "../../config";
import { Product, Category } from "../../types";
import ProductModal from "./ProductModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { optimizeCloudinaryUrl } from "../../lib/cloudinary";
import { useAuth } from "../../context/AuthContext";

const ProductPanel = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
  }>({ isOpen: false, productId: null, productName: "" });
  const [isDeleting, setIsDeleting] = useState(false);

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
  const fetchProducts = async (page = 1, categoryId?: string, search?: string) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "12"); // Constant limit per page

      if (categoryId && categoryId !== "all") {
        params.append("categoryId", categoryId);
      }
      if (search) {
        params.append("search", search);
      }

      const url = `${API}/product?${params.toString()}`;
      const { data } = await axios.get(url);

      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setCurrentPage(data.currentPage || 1);
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
    fetchProducts(1);
  }, []);

  /* -----------------------------------
        FILTER CHANGE
  ----------------------------------- */
  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    fetchProducts(1, id, searchTerm);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    fetchProducts(1, selectedCategory, val);
  };

  /* -----------------------------------
        DELETE PRODUCT
  ----------------------------------- */
  const openDeleteConfirm = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, productId: id, productName: name });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ isOpen: false, productId: null, productName: "" });
  };

  const deleteProduct = async () => {
    if (!deleteConfirm.productId) return;

    try {
      setIsDeleting(true);
      await axios.delete(`${API}/product/${deleteConfirm.productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProducts((prev) =>
        prev.filter((p) => p._id !== deleteConfirm.productId)
      );

      toast.success("Product deleted");
      closeDeleteConfirm();
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  /* -----------------------------------
        TOGGLE STOCK
  ----------------------------------- */
  const toggleStock = async (id: string) => {
    try {
      await axios.patch(`${API}/product/${id}/stock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProducts(prev => 
        prev.map(p => p._id === id ? { ...p, isOutOfStock: !p.isOutOfStock } : p)
      );
      toast.success("Stock status updated");
    } catch {
      toast.error("Failed to update stock status");
    }
  };

  /* -----------------------------------
        TOGGLE BEST SELLER
  ----------------------------------- */
  const toggleBestSeller = async (id: string) => {
    try {
      await axios.patch(`${API}/product/${id}/best-seller`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProducts(prev => 
        prev.map(p => p._id === id ? { ...p, isBestSeller: !(p as any).isBestSeller } : p)
      );
      toast.success("Best Seller status updated");
    } catch {
      toast.error("Failed to update Best Seller status");
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
    fetchProducts(currentPage, selectedCategory, searchTerm);
  };

  return (
    <>
      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E5E5E5] flex flex-col sm:flex-row gap-4 justify-between items-center">
          <h2 className="text-lg font-bold">Catalog Management</h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* SEARCH INPUT */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-full text-xs font-medium w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#EE1C47]/20"
              />
            </div>

            {/* CATEGORY FILTER */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EE1C47]/20"
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
              className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#EE1C47] transition-colors"
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
                  <th className="px-8 py-4 text-left">Category</th>
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
                          src={optimizeCloudinaryUrl(p.images?.[0] || "", 100)}
                          className="w-12 h-12 rounded-lg object-cover"
                        />

                        <div className="flex flex-col">
                          <p className="text-sm font-semibold">{p.name}</p>
                          <div className="flex gap-2 items-center mt-1">
                            {p.isOutOfStock ? (
                              <button
                                onClick={() => toggleStock(p._id)}
                                className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm animate-pulse cursor-pointer hover:bg-red-600 transition-colors"
                              >
                                Out of Stock
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleStock(p._id)}
                                className="text-green-600 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-green-200 cursor-pointer hover:bg-green-50 transition-colors"
                              >
                                In Stock
                              </button>
                            )}
                            {p.premiumWrapping && (
                              <span className="text-pink-500 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-pink-200">
                                Premium
                              </span>
                            )}
                            {(p as any).isBestSeller ? (
                              <button
                                onClick={() => toggleBestSeller(p._id)}
                                className="bg-amber-400 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded shadow-sm cursor-pointer hover:bg-amber-500 transition-colors"
                              >
                                Best Seller
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleBestSeller(p._id)}
                                className="text-amber-600 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-200 cursor-pointer hover:bg-amber-50 transition-colors"
                              >
                                Set Best Seller
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-4">
                      <span className="text-[10px] bg-gray-100 px-2.5 py-1 rounded-md text-gray-500 font-bold uppercase tracking-widest border border-gray-200">
                        {(p as any).categoryId?.name || "Uncategorized"}
                      </span>
                    </td>

                    <td className="px-8 py-4 font-medium italic">₹{p.price}</td>

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
                          onClick={() => openDeleteConfirm(p._id, p.name)}
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

        {/* PAGINATION FOOTER */}
        {!loading && products.length > 0 && (
          <div className="p-6 border-t border-[#E5E5E5] flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Showing {products.length} of {totalCount} products
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => fetchProducts(currentPage - 1, selectedCategory, searchTerm)}
                className="px-4 py-2 border rounded-full text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-white transition-colors"
              >
                Previous
              </button>

              <span className="text-[10px] font-bold px-4">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => fetchProducts(currentPage + 1, selectedCategory, searchTerm)}
                className="px-4 py-2 border rounded-full text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        product={editingProduct}
        mode={editingProduct ? "edit" : "add"}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={closeDeleteConfirm}
        onConfirm={deleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isDeleting}
      />
    </>
  );
};

export default ProductPanel;

