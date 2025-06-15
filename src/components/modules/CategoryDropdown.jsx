import { useState, useRef, useEffect } from "react";

const CategoryDropdown = ({
  categories,
  selectedCategory,
  onCategoryChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Build hierarchical structure
  const buildCategoryHierarchy = (categories) => {
    const hierarchy = [];
    const categoryMap = new Map();

    // First pass: create map of all categories
    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), {
        ...category,
        children: [],
      });
    });

    // Second pass: build hierarchy
    categories.forEach((category) => {
      const cat = categoryMap.get(category._id.toString());
      const parentId = category.parent?._id || category.parent;

      if (parentId) {
        const parent = categoryMap.get(parentId.toString());
        if (parent) {
          parent.children.push(cat);
        }
      } else {
        hierarchy.push(cat);
      }
    });

    return hierarchy;
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "All Categories";
    const category = categories.find(
      (cat) => cat._id.toString() === selectedCategory
    );
    return category ? category.name : "All Categories";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Render category option
  const CategoryOption = ({ category, depth = 0, onSelect }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategory === category._id.toString();

    return (
      <>
        {" "}
        <div
          className={`px-4 py-3 cursor-pointer transition-all duration-200 flex items-center category-item ${
            isSelected
              ? "bg-luxury-gold text-white"
              : "hover:bg-luxury-gold/10 text-luxury-dark"
          }`}
          style={{ paddingLeft: `${16 + depth * 24}px` }}
          onClick={() => onSelect(category._id.toString())}
        >
          {depth > 0 && (
            <span className="text-luxury-gold/60 mr-2 font-mono text-sm select-none">
              └─
            </span>
          )}
          <span className="font-serif flex-1">{category.name}</span>
          {hasChildren && (
            <span className="ml-2 text-luxury-gold/70 opacity-70">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          )}
        </div>
        {hasChildren &&
          category.children.map((child) => (
            <CategoryOption
              key={child._id}
              category={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
      </>
    );
  };

  const handleCategorySelect = (categoryId) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  const hierarchy = buildCategoryHierarchy(categories);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        className={`w-full p-3 border-b border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif text-left flex items-center justify-between transition-all duration-200 ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-luxury-gold"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span>{getSelectedCategoryName()}</span>
        <svg
          className={`w-5 h-5 text-luxury-gold transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>{" "}
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-luxury-gold/20 shadow-lg max-h-64 overflow-y-auto rounded-sm category-dropdown-menu animate-fade-in-up">
          {/* All Categories Option */}
          <div
            className={`px-4 py-3 cursor-pointer transition-all duration-200 category-item ${
              !selectedCategory
                ? "bg-luxury-gold text-white"
                : "hover:bg-luxury-gold/10 text-luxury-dark"
            }`}
            onClick={() => handleCategorySelect("")}
          >
            <span className="font-serif">All Categories</span>
          </div>

          {/* Hierarchical Categories */}
          {hierarchy.map((category) => (
            <CategoryOption
              key={category._id}
              category={category}
              onSelect={handleCategorySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
