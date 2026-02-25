import React from "react";
import { motion } from "framer-motion";

const ProductSkeleton: React.FC = () => {
  return (
    <div className="group h-full flex flex-col w-full animate-pulse">
      {/* Image Skeleton */}
      <div className="block relative overflow-hidden rounded-[1.25rem] bg-gray-200 aspect-[4/5] mb-4 w-full" />

      {/* Info Skeleton */}
      <div className="flex flex-col flex-1 px-1">
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="h-4 bg-gray-200 rounded w-10" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
