import React from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { PRODUCTS, CATEGORIES } from "../constants";
import ProductCard from "../components/ProductCard";

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const category = CATEGORIES.find((c) => c.id === id);
  const products = PRODUCTS.filter((p) => p.category === id);

  if (!category)
    return (
      <div className="p-20 text-center font-serif text-2xl">
        Category not found
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-6 py-12 pt-32"
    >
      <header className="mb-16 border-b border-gray-100 pb-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#F8BBD0] font-bold mb-3 block">
            Boutique Collection
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-[#1A1A1A] mb-4">
            {category.name}
          </h1>
          <p className="text-[#4A4A4A] max-w-xl text-base font-light leading-relaxed italic">
            {category.description}
          </p>
        </motion.div>
      </header>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
          <p className="text-gray-400 font-serif italic text-xl">
            Curating new botanical wonders for this collection...
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryPage;
