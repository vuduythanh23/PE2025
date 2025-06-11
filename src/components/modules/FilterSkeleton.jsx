import React from "react";

const FilterSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Category Filter Skeleton */}
      <div>
        <div className="h-6 bg-gray-300 rounded w-20 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>

      {/* Brand Filter Skeleton */}
      <div>
        <div className="h-6 bg-gray-300 rounded w-16 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>

      {/* Price Range Filter Skeleton */}
      <div>
        <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>

      {/* Filter Actions Skeleton */}
      <div className="flex justify-between gap-6 mt-12">
        <div className="flex-1 h-12 bg-gray-200 rounded"></div>
        <div className="flex-1 h-12 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default FilterSkeleton;
