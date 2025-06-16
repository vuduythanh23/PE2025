import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../utils/api/categories";

export default function CategoryQuickFilter({ 
  onParentCategorySelect, 
  selectedParentCategory 
}) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Main category configuration
  const mainCategories = [
    {
      key: "men",
      name: "Men",
      color: "from-luxury-dark to-luxury-forest",
      hoverColor: "hover:from-luxury-forest hover:to-black",
      shadowColor: "hover:shadow-luxury-dark/40",
      borderColor: "border-luxury-gold/20",
      icon: (
        <svg
          className="w-6 h-6 md:w-7 md:h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      key: "women",
      name: "Women",
      color: "from-luxury-gold to-yellow-600",
      hoverColor: "hover:from-yellow-600 hover:to-amber-700",
      shadowColor: "hover:shadow-luxury-gold/40",
      borderColor: "border-luxury-light/30",
      icon: (
        <svg
          className="w-6 h-6 md:w-7 md:h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
          <circle cx="12" cy="2" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      key: "kids",
      name: "Kids",
      color: "from-luxury-light to-luxury-gold",
      hoverColor: "hover:from-luxury-gold hover:to-yellow-500",
      shadowColor: "hover:shadow-luxury-light/40",
      borderColor: "border-luxury-gold/25",
      icon: (
        <svg
          className="w-6 h-6 md:w-7 md:h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await getCategories();
      const categoriesArray = Array.isArray(data) ? data : [];
      setCategories(categoriesArray);

      // Debug: log available categories
      console.log(
        "Available categories:",
        categoriesArray.map((cat) => ({
          id: cat._id || cat.id,
          name: cat.name,
          type: cat.type,
          parent: cat.parent,
        }))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCategoryClick = (categoryKey) => {
    // Notify parent component about parent category selection
    if (onParentCategorySelect) {
      onParentCategorySelect(categoryKey);
    }

    // Find main category by name (case insensitive)
    const mainCategory = categories.find((cat) => {
      const categoryName = cat.name?.toLowerCase() || "";
      const searchKey = categoryKey.toLowerCase();

      // Check exact match first
      if (categoryName === searchKey) return true;

      // Check if category name contains the key
      if (categoryName.includes(searchKey)) return true;

      // Check for specific mappings
      if (
        searchKey === "men" &&
        (categoryName.includes("men") || categoryName.includes("male"))
      )
        return true;
      if (
        searchKey === "women" &&
        (categoryName.includes("women") ||
          categoryName.includes("female") ||
          categoryName.includes("woman"))
      )
        return true;
      if (
        searchKey === "kids" &&
        (categoryName.includes("kids") ||
          categoryName.includes("children") ||
          categoryName.includes("child"))
      )
        return true;

      return false;
    });

    if (mainCategory) {
      console.log(
        `Navigating to category: ${mainCategory.name} (${mainCategory._id})`
      );
      navigate(
        `/products?category=${encodeURIComponent(
          mainCategory._id || mainCategory.id
        )}`
      );
    } else {
      // Fallback: try to find any category that might match
      const fallbackCategory = categories.find((cat) =>
        cat.name?.toLowerCase().includes(categoryKey.toLowerCase())
      );

      if (fallbackCategory) {
        console.log(
          `Fallback navigation to: ${fallbackCategory.name} (${fallbackCategory._id})`
        );
        navigate(
          `/products?category=${encodeURIComponent(
            fallbackCategory._id || fallbackCategory.id
          )}`
        );
      } else {
        // Last resort: navigate with category name as filter
        console.log(`No category found, searching for: ${categoryKey}`);
        navigate(`/products?search=${encodeURIComponent(categoryKey)}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center space-x-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 w-32 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">        {mainCategories.map((category) => {
          const isSelected = selectedParentCategory === category.key;
          return (
            <button
              key={category.key}
              onClick={() => handleCategoryClick(category.key)}
              className={`
                group relative overflow-hidden
                bg-gradient-to-br ${category.color} ${category.hoverColor}
                text-white font-serif
                px-8 py-6 md:px-10 md:py-8
                rounded-lg
                transform transition-all duration-500 ease-out
                hover:scale-[1.03] ${category.shadowColor}
                shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.18)]
                focus:outline-none focus:ring-3 focus:ring-luxury-gold/50
                active:scale-[0.98]
                border ${category.borderColor} hover:border-luxury-gold/40
                backdrop-blur-sm
                hover:-translate-y-1
                ${isSelected ? 'ring-4 ring-luxury-gold/60 scale-[1.02] border-luxury-gold shadow-[0_16px_40px_rgb(0,0,0,0.2)]' : ''}
              `}
            >
            {" "}
            {/* Luxury Background Pattern */}
            <div className="absolute inset-0 opacity-[0.1]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-luxury-gold rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-luxury-gold rounded-full translate-y-14 -translate-x-14"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-luxury-gold rounded-full -translate-x-8 -translate-y-8"></div>
            </div>
            {/* Gold Accent Ring */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-luxury-gold/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
              <div className="text-white/95 group-hover:text-luxury-gold transition-all duration-300 transform group-hover:scale-110">
                {category.icon}              </div>
              <span className="text-lg md:text-xl font-serif font-medium tracking-wide">
                {category.name}
              </span>
            </div>
          </button>
          );
        })}
      </div>{" "}
      {/* Subtitle */}
      <div className="text-center mt-8">
        <p className="text-luxury-dark text-sm md:text-base font-light tracking-wide">
          Choose a category to explore our collection
        </p>
      </div>
    </div>
  );
}
