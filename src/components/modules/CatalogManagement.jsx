import React, { useState, useEffect } from "react";
import {
  getProducts,
  deleteProduct,
  getProductById,
} from "../../utils/api/products";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../utils/api/brands";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../utils/api/categories";
import ProductForm from "./ProductForm";
import Swal from "sweetalert2";
import { useLoading } from "../../context/LoadingContext";

// Icons
import {
  FaBox,
  FaTags,
  FaLayerGroup,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaEye,
} from "react-icons/fa";

const CatalogManagement = () => {
  // Active section state
  const [activeSection, setActiveSection] = useState("products");

  // Products state
  const [products, setProducts] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Brands state
  const [brands, setBrands] = useState([]);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [brandFormData, setBrandFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
  });
  const [editingBrand, setEditingBrand] = useState(null);
  // Categories state
  const [categories, setCategories] = useState([]);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    slug: "",
    parent: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);

  // Common state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brandErrors, setBrandErrors] = useState({});
  const [categoryErrors, setCategoryErrors] = useState({});

  const { handleAsyncOperation } = useLoading();

  // Initial data loading
  useEffect(() => {
    if (activeSection === "products") {
      fetchProducts();
    } else if (activeSection === "brands") {
      fetchBrands();
    } else if (activeSection === "categories") {
      fetchCategories();
    }
  }, [activeSection]);

  // Filter products based on search query
  useEffect(() => {
    if (products.length) {
      setFilteredProducts(
        productSearchQuery
          ? products.filter((product) =>
              product.name
                .toLowerCase()
                .includes(productSearchQuery.toLowerCase())
            )
          : products
      );
    }
  }, [products, productSearchQuery]);

  // Filter brands based on search query
  useEffect(() => {
    if (brands.length) {
      setFilteredBrands(
        brandSearchQuery
          ? brands.filter((brand) =>
              brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
            )
          : brands
      );
    }
  }, [brands, brandSearchQuery]);
  // Filter categories based on search query
  useEffect(() => {
    if (categories.length) {
      setFilteredCategories(
        categorySearchQuery
          ? categories.filter((category) =>
              category.name
                .toLowerCase()
                .includes(categorySearchQuery.toLowerCase())
            )
          : categories
      );
    }
  }, [categories, categorySearchQuery]);

  // Add ESC key handlers to close modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showBrandForm) {
          setShowBrandForm(false);
          setEditingBrand(null);
          setBrandFormData({
            name: "",
            description: "",
            logoUrl: "",
          });
          setBrandErrors({});
        }
        if (showCategoryForm) {
          setShowCategoryForm(false);
          setEditingCategory(null);
          setCategoryFormData({
            name: "",
            description: "",
            slug: "",
            parent: "",
          });
          setCategoryErrors({});
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showBrandForm, showCategoryForm]);

  // ========== PRODUCT FUNCTIONS ==========
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await handleAsyncOperation(
        () => getProducts({}, true), // forceLoadAll = true cho admin
        "Fetching products"
      );
      setProducts(Array.isArray(data) ? data : []);
      setFilteredProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await handleAsyncOperation(
            () => deleteProduct(id),
            "Deleting product"
          );
          await fetchProducts();
          Swal.fire("Deleted!", "Product has been deleted.", "success");
        }
      });
    } catch (err) {
      console.error("Error deleting product:", err);
      Swal.fire("Error", "Failed to delete product", "error");
    }
  };

  const handleEditProduct = async (id) => {
    try {
      setLoading(true);
      const product = await handleAsyncOperation(
        () => getProductById(id),
        "Fetching product details"
      );
      setSelectedProduct(product);
      setShowProductForm(true);
    } catch (err) {
      console.error("Error fetching product:", err);
      Swal.fire("Error", "Failed to load product details", "error");
    } finally {
      setLoading(false);
    }
  };
  // ========== BRAND FUNCTIONS ==========
  const fetchBrands = async () => {
    try {
      setLoading(true);
      // Fetch both brands and products to calculate product counts
      const [brandsData, productsData] = await Promise.all([
        handleAsyncOperation(() => getBrands(), "Fetching brands"),
        handleAsyncOperation(
          () => getProducts({}, true), // forceLoadAll = true cho admin
          "Fetching products for counts"
        ),
      ]);

      // Validate and normalize brands data
      const brandsArray = Array.isArray(brandsData) ? brandsData : [];

      // Process products to count by brand
      const productsByBrand = {};
      if (Array.isArray(productsData)) {
        productsData.forEach((product) => {
          if (product && product.brand) {
            // Extract brand ID based on whether it's an object or string
            const brandId =
              typeof product.brand === "object"
                ? product.brand._id || product.brand.id
                : product.brand;

            if (brandId) {
              // Initialize counter if needed
              if (!productsByBrand[brandId]) {
                productsByBrand[brandId] = 0;
              }
              // Increment the counter
              productsByBrand[brandId]++;
            }
          }
        });
      }

      // Add product count to each brand
      const brandsWithCounts = brandsArray.map((brand) => {
        const brandId = brand._id || brand.id;
        return {
          ...brand,
          productCount: productsByBrand[brandId] || 0,
        };
      });

      setBrands(brandsWithCounts);
      setFilteredBrands(brandsWithCounts);
      setError(null);
    } catch (err) {
      console.error("Error fetching brands:", err);
      setError("Failed to load brands. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBrandInputChange = (e) => {
    const { name, value } = e.target;
    setBrandFormData({
      ...brandFormData,
      [name]: value,
    });
  };

  const validateBrandForm = () => {
    const errors = {};
    if (!brandFormData.name.trim()) errors.name = "Brand name is required";
    return errors;
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();

    const errors = validateBrandForm();
    if (Object.keys(errors).length > 0) {
      setBrandErrors(errors);
      return;
    }

    try {
      if (editingBrand) {
        await handleAsyncOperation(
          () => updateBrand(editingBrand._id || editingBrand.id, brandFormData),
          "Updating brand"
        );
        Swal.fire("Success", "Brand updated successfully", "success");
      } else {
        await handleAsyncOperation(
          () => createBrand(brandFormData),
          "Creating brand"
        );
        Swal.fire("Success", "Brand created successfully", "success");
      }

      setShowBrandForm(false);
      setEditingBrand(null);
      setBrandFormData({
        name: "",
        description: "",
        logoUrl: "",
      });
      setBrandErrors({});
      fetchBrands();
    } catch (err) {
      console.error("Error saving brand:", err);
      Swal.fire("Error", "Failed to save brand", "error");
    }
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    setBrandFormData({
      name: brand.name || "",
      description: brand.description || "",
      logoUrl: brand.logoUrl || "",
    });
    setShowBrandForm(true);
  };

  const handleDeleteBrand = async (id) => {
    try {
      await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await handleAsyncOperation(() => deleteBrand(id), "Deleting brand");
          await fetchBrands();
          Swal.fire("Deleted!", "Brand has been deleted.", "success");
        }
      });
    } catch (err) {
      console.error("Error deleting brand:", err);
      Swal.fire("Error", "Failed to delete brand", "error");
    }
  }; // ========== CATEGORY FUNCTIONS ==========
  const fetchCategories = async () => {
    try {
      setLoading(true); // Fetch both categories and products to calculate product counts
      const [categoriesData, productsData] = await Promise.all([
        handleAsyncOperation(() => getCategories(), "Fetching categories"),
        handleAsyncOperation(
          () => getProducts({}, true), // forceLoadAll = true cho admin
          "Fetching products for counts"
        ),
      ]); // Validate and normalize categories data
      const categoriesArray = Array.isArray(categoriesData)
        ? categoriesData
        : [];      // Debug section - removed console.log statements

      // Fix category hierarchy based on actual API data
      const fixedCategories = fixCategoryHierarchy(categoriesArray);

      // Detailed analysis of each category
      fixedCategories.forEach((cat, index) => {
        console.log(`Category ${index + 1}: ${cat.name}`, {
          id: cat._id,
          parent: cat.parent,
          parentType: typeof cat.parent,
          parentId: cat.parentId,
          parentCategory: cat.parentCategory?.name,
          type: cat.type,
          slug: cat.slug,
        });
      });

      // Products data - debug removed

      // Process products to count by category
      const directProductsByCategory = {};
      if (Array.isArray(productsData)) {
        productsData.forEach((product) => {
          if (product && product.category) {
            // Extract category ID based on whether it's an object or string
            const categoryId =
              typeof product.category === "object"
                ? product.category._id || product.category.id
                : product.category;

            if (categoryId) {
              // Initialize counter if needed
              if (!directProductsByCategory[categoryId]) {
                directProductsByCategory[categoryId] = 0;
              }
              // Increment the counter
              directProductsByCategory[categoryId]++;
            }
          }
        });
      } // Helper function to get all child category IDs recursively
      const getAllChildCategoryIds = (parentId, categories) => {
        const childIds = [];
        const directChildren = categories.filter((cat) => {
          const pId = cat.parent || cat.parentId;
          return pId === parentId;
        });

        directChildren.forEach((child) => {
          const childId = child._id || child.id;
          childIds.push(childId);
          // Recursively get children of this child
          childIds.push(...getAllChildCategoryIds(childId, categories));
        });

        return childIds;
      };

      // Calculate total product count for each category (including children)
      const categoriesWithCounts = fixedCategories.map((category) => {
        const categoryId = category._id || category.id;

        // Get direct products of this category
        const directCount = directProductsByCategory[categoryId] || 0;
        // Get all child category IDs
        const childCategoryIds = getAllChildCategoryIds(
          categoryId,
          fixedCategories
        );

        // Sum up products from all child categories
        const childrenCount = childCategoryIds.reduce((sum, childId) => {
          return sum + (directProductsByCategory[childId] || 0);
        }, 0);

        const totalCount = directCount + childrenCount;

        console.log(`Debug - Category ${category.name} (${categoryId}):`, {
          directCount,
          childCategoryIds,
          childrenCount,
          totalCount,
          parentField: category.parent,
          parentIdField: category.parentId,
        });

        return {
          ...category,
          productCount: totalCount,
          directProductCount: directCount,
        };
      });

      // Final processed categories - debug removed
      categoriesWithCounts.forEach((cat) => {
        console.log(`${cat.name}:`, {
          id: cat._id,
          parent: cat.parent,
          productCount: cat.productCount,
          directProductCount: cat.directProductCount,
        });
      });

      setCategories(categoriesWithCounts);
      setFilteredCategories(categoriesWithCounts);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;

    // Auto-generate slug when name changes
    const updatedData = {
      ...categoryFormData,
      [name]: value,
    };

    if (name === "name") {
      updatedData.slug = generateSlug(value);
    }

    setCategoryFormData(updatedData);
  };

  const validateCategoryForm = () => {
    const errors = {};
    if (!categoryFormData.name.trim())
      errors.name = "Category name is required";
    if (!categoryFormData.slug.trim()) errors.slug = "Slug is required";
    return errors;
  };
  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    const errors = validateCategoryForm();
    if (Object.keys(errors).length > 0) {
      setCategoryErrors(errors);
      return;
    }

    try {
      // Chuyển đổi từ parentId thành parent để khớp với schema của API
      const categoryData = { ...categoryFormData };
      // Nếu có parentId và không rỗng, đổi thành parent
      if (
        categoryData.parent === "" ||
        categoryData.parent === null ||
        categoryData.parent === undefined
      ) {
        delete categoryData.parent;
      }

      if (editingCategory) {
        await handleAsyncOperation(
          () =>
            updateCategory(
              editingCategory._id || editingCategory.id,
              categoryData
            ),
          "Updating category"
        );
        Swal.fire("Success", "Category updated successfully", "success");
      } else {
        await handleAsyncOperation(
          () => createCategory(categoryData),
          "Creating category"
        );
        Swal.fire("Success", "Category created successfully", "success");
      }

      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        description: "",
        slug: "",
        parent: "",
      });
      setCategoryErrors({});
      fetchCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      Swal.fire("Error", "Failed to save category", "error");
    }
  };
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name || "",
      description: category.description || "",
      slug: category.slug || "",
      parent: category.parent || category.parentId || "",
    });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await handleAsyncOperation(
            () => deleteCategory(id),
            "Deleting category"
          );
          await fetchCategories();
          Swal.fire("Deleted!", "Category has been deleted.", "success");
        }
      });
    } catch (err) {
      console.error("Error deleting category:", err);
      Swal.fire("Error", "Failed to delete category", "error");
    }
  };

  // Helper function to get potential parent categories (excludes self and its children when editing)
  const getPotentialParentCategories = () => {
    if (!editingCategory) return categories;

    // When editing, don't allow selecting self or any child categories as parent
    const editingId = editingCategory._id || editingCategory.id;

    // Find all child category IDs to exclude them
    const childIds = [];
    const findChildren = (parentId) => {
      const children = categories.filter((cat) => {
        const pId = cat.parent || cat.parentId;
        return pId === parentId;
      });

      children.forEach((child) => {
        const childId = child._id || child.id;
        childIds.push(childId);
        findChildren(childId); // Recursively find children of this child
      });
    };

    // Start finding children from the editing category
    findChildren(editingId);

    // Filter out self and all children
    return categories.filter((cat) => {
      const catId = cat._id || cat.id;
      return catId !== editingId && !childIds.includes(catId);
    });
  }; // Helper function to format category names for the dropdown with proper indentation
  const formatCategoryNameForDropdown = (category) => {
    // Calculate depth by counting parents
    let depth = 0;
    let currentParentId = category.parent || category.parentId;

    while (currentParentId) {
      depth++;
      const parent = categories.find(
        (c) => c._id === currentParentId || c.id === currentParentId
      );
      if (!parent) break;
      currentParentId = parent.parent || parent.parentId;
    }

    // Add indentation based on depth
    const indent = "—".repeat(depth);
    return depth > 0 ? `${indent} ${category.name}` : category.name;
  };

  // Helper function to sort categories hierarchically
  const sortCategoriesHierarchically = (categoriesToSort) => {
    const sorted = [];
    const processed = new Set();

    // Helper function to add category and its children recursively
    const addCategoryAndChildren = (category) => {
      if (processed.has(category._id || category.id)) return;

      processed.add(category._id || category.id);
      sorted.push(category);

      // Find and add children
      const children = categoriesToSort
        .filter((cat) => {
          const parentId = cat.parent || cat.parentId;
          return parentId === (category._id || category.id);
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      children.forEach(addCategoryAndChildren);
    };

    // First add all top-level categories
    const topLevel = categoriesToSort
      .filter((cat) => !cat.parent && !cat.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));

    topLevel.forEach(addCategoryAndChildren);

    // Add any remaining categories that might not have been processed
    categoriesToSort.forEach((cat) => {
      if (!processed.has(cat._id || cat.id)) {
        addCategoryAndChildren(cat);
      }
    });

    return sorted;
  };

  // Helper function to fix category hierarchy based on actual API data structure
  const fixCategoryHierarchy = (categories) => {
    // Fixing category hierarchy - debug removed

    // Create a map for quick lookup
    const categoryMap = new Map();
    categories.forEach((cat) => {
      categoryMap.set(cat._id || cat.id, cat);
    });

    // Category map - debug removed

    // Process each category to ensure parent relationship is correct
    const fixedCategories = categories.map((category) => {
      const fixed = { ...category };

      // Handle different parent field formats
      let parentId = category.parent || category.parentId;

      if (parentId) {
        // If parent is an object with _id, extract the ID
        if (typeof parentId === "object" && parentId._id) {
          parentId = parentId._id;
          fixed.parent = parentId;
        }

        // Try to find the actual parent category
        const parentCategory = categoryMap.get(parentId);

        console.log(`Category ${category.name} parent lookup:`, {
          originalParent: category.parent,
          parentId: parentId,
          foundParent: parentCategory?.name || "NOT FOUND",
          allParents: Array.from(categoryMap.keys()),
        });

        // If parent is found, ensure the relationship is clear
        if (parentCategory) {
          fixed.parentCategory = parentCategory;
          fixed.parent = parentId; // Ensure it's stored as ID string
        } else {
          console.warn(
            `Parent category ${parentId} not found for ${category.name}`
          );
          // Maybe the parent ID is invalid, treat as top level
          delete fixed.parent;
          delete fixed.parentId;
        }
      }

      return fixed;
    });

    console.log("Fixed categories:", fixedCategories);
    return fixedCategories;
  };

  // Helper function to organize categories into parent-child structure
  const organizeCategories = () => {
    const parentCategories = [];
    const childCategories = [];

    filteredCategories.forEach((category) => {
      const parentId = category.parent || category.parentId;
      if (!parentId) {
        parentCategories.push(category);
      } else {
        childCategories.push(category);
      }
    }); // Calculate total products for parent categories
    const parentCategoriesWithTotals = parentCategories.map((parent) => {
      const children = childCategories.filter((child) => {
        const childParentId = child.parent || child.parentId;
        return childParentId === parent._id || childParentId === parent.id;
      }); // Debug: Log the parent data to understand what backend returns
      console.log(`=== DEBUG PARENT CATEGORY: ${parent.name} ===`);
      console.log("Parent data:", {
        id: parent._id || parent.id,
        productCount: parent.productCount,
        directProductCount: parent.directProductCount,
        children: children.map((c) => ({
          name: c.name,
          productCount: c.productCount,
        })),
      });

      // Calculate children products count
      const childrenProductCount = children.reduce((sum, child) => {
        return sum + (child.productCount || 0);
      }, 0);

      // Determine direct product count
      // If backend provides directProductCount, use it
      // If not, check if productCount seems to be total (by comparing with children sum)
      let directProductCount;
      let totalProductCount;

      if (parent.directProductCount !== undefined) {
        // Backend explicitly provides direct count
        directProductCount = parent.directProductCount;
        totalProductCount = directProductCount + childrenProductCount;
      } else if (parent.productCount !== undefined) {
        // Backend only provides productCount - need to determine if it's direct or total
        const backendProductCount = parent.productCount;

        if (childrenProductCount === 0) {
          // No children, so productCount is direct
          directProductCount = backendProductCount;
          totalProductCount = backendProductCount;
        } else {
          // Has children - check if productCount seems like total
          if (backendProductCount > childrenProductCount) {
            // productCount > children sum, likely total, calculate direct
            directProductCount = backendProductCount - childrenProductCount;
            totalProductCount = backendProductCount;
          } else {
            // productCount <= children sum, likely direct
            directProductCount = backendProductCount;
            totalProductCount = directProductCount + childrenProductCount;
          }
        }
      } else {
        // No product count from backend
        directProductCount = 0;
        totalProductCount = childrenProductCount;
      }

      console.log("Calculated:", {
        directProductCount,
        childrenProductCount,
        totalProductCount,
      });

      return {
        ...parent,
        children: children,
        totalProductCount: totalProductCount,
        directProductCount: directProductCount,
      };
    });

    console.log("=== ORGANIZED CATEGORIES ===");
    console.log("Parent categories:", parentCategoriesWithTotals);
    console.log(
      "Orphan children:",
      childCategories.filter((child) => {
        const childParentId = child.parent || child.parentId;
        return !parentCategories.some(
          (parent) =>
            parent._id === childParentId || parent.id === childParentId
        );
      })
    );

    return {
      parentCategories: parentCategoriesWithTotals,
      orphanChildren: childCategories.filter((child) => {
        const childParentId = child.parent || child.parentId;
        return !parentCategories.some(
          (parent) =>
            parent._id === childParentId || parent.id === childParentId
        );
      }),
    };
  };

  // State for dropdown management
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Functions to handle expand/collapse all
  const expandAllCategories = () => {
    const { parentCategories } = organizeCategories();
    const allParentIds = parentCategories
      .filter((parent) => parent.children && parent.children.length > 0)
      .map((parent) => parent._id || parent.id);
    setExpandedCategories(new Set(allParentIds));
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };
  // Function to render category row
  const renderCategoryRow = (category, isChild = false, parentId = null) => {
    return (
      <tr
        key={category._id || category.id}
        className={`hover:bg-gray-50 transition-colors duration-150 ${
          isChild ? "category-child-row category-dropdown-animation" : ""
        }`}
      >
        <td className="py-4 px-4">
          <div className={`flex items-center ${isChild ? "pl-8" : ""}`}>
            <FaLayerGroup
              className={`mr-2 ${isChild ? "text-blue-500" : "text-amber-500"}`}
            />
            <span className={isChild ? "category-child-name" : "font-medium"}>
              {category.name}
            </span>
          </div>
        </td>
        <td className="py-4 px-4">
          {isChild ? (
            <span className="flex items-center text-blue-600">
              <FaLayerGroup className="text-gray-400 mr-1" />
              {/* Find parent name */}
              {categories.find((c) => c._id === parentId || c.id === parentId)
                ?.name || "Unknown"}
            </span>
          ) : (
            <span className="text-gray-500 italic">None (Top Level)</span>
          )}
        </td>
        <td className="py-4 px-4">
          {category.description && category.description.length > 50
            ? `${category.description.substring(0, 50)}...`
            : category.description || (
                <span className="text-gray-400 italic">No description</span>
              )}
        </td>{" "}
        <td className="py-4 px-4">
          <div className="flex items-center">
            <span
              className={
                isChild
                  ? "category-product-count-child"
                  : "category-product-count-parent"
              }
            >
              {isChild
                ? category.productCount || 0
                : category.totalProductCount || category.productCount || 0}
            </span>
            {!isChild && category.directProductCount !== undefined && (
              <span className="ml-2 text-xs text-gray-500">
                ({category.directProductCount} direct)
              </span>
            )}
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditCategory(category)}
              className="text-blue-500 hover:text-blue-700 transition-colors"
              title="Edit category"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDeleteCategory(category._id || category.id)}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Delete category"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Function to render categories with dropdown structure
  const renderCategoriesWithDropdown = () => {
    const { parentCategories, orphanChildren } = organizeCategories();
    const rows = [];

    // Render parent categories with their children
    parentCategories.forEach((parent) => {
      const isExpanded = expandedCategories.has(parent._id || parent.id);
      const hasChildren = parent.children && parent.children.length > 0; // Parent category row
      rows.push(
        <tr
          key={parent._id || parent.id}
          className="category-parent-row hover:bg-gradient-to-r hover:from-amber-100 hover:to-yellow-100 transition-all duration-200"
        >
          <td className="py-4 px-4">
            <div className="flex items-center">
              {hasChildren && (
                <button
                  onClick={() =>
                    toggleCategoryExpansion(parent._id || parent.id)
                  }
                  className="category-expand-button mr-2"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <svg
                      className="w-4 h-4 text-amber-600"
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
                  ) : (
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </button>
              )}
              <FaLayerGroup className="text-amber-500 mr-2" />
              <span className="category-parent-name">{parent.name}</span>
              {hasChildren && (
                <span className="category-subcategory-badge">
                  {parent.children.length} subcategories
                </span>
              )}
            </div>
          </td>
          <td className="py-4 px-4">
            <span className="text-gray-500 italic font-medium">
              None (Top Level)
            </span>
          </td>
          <td className="py-4 px-4">
            {parent.description && parent.description.length > 50
              ? `${parent.description.substring(0, 50)}...`
              : parent.description || (
                  <span className="text-gray-400 italic">No description</span>
                )}
          </td>{" "}
          <td className="py-4 px-4">
            <div className="flex items-center">
              <span className="category-product-count-parent">
                {parent.totalProductCount || parent.productCount || 0}
              </span>
              {parent.directProductCount !== undefined && (
                <span className="ml-2 text-xs text-gray-500">
                  ({parent.directProductCount} direct)
                </span>
              )}
            </div>
          </td>
          <td className="py-4 px-4">
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditCategory(parent)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
                title="Edit category"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteCategory(parent._id || parent.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Delete category"
              >
                <FaTrash />
              </button>
            </div>
          </td>
        </tr>
      );

      // Children rows (if expanded)
      if (isExpanded && hasChildren) {
        parent.children.forEach((child) => {
          rows.push(renderCategoryRow(child, true, parent._id || parent.id));
        });
      }
    });

    // Render orphan children (categories without valid parents)
    if (orphanChildren.length > 0) {
      rows.push(
        <tr key="orphan-header" className="bg-red-50">
          <td
            colSpan="5"
            className="py-2 px-4 text-center text-red-600 font-medium text-sm"
          >
            ⚠️ Categories with missing or invalid parent references
          </td>
        </tr>
      );

      orphanChildren.forEach((child) => {
        rows.push(renderCategoryRow(child, false));
      });
    }

    return rows;
  };

  // ========== RENDERING ==========
  return (
    <div className="catalog-management">
      {/* Tab Headers with Icons */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors relative whitespace-nowrap
            ${
              activeSection === "products"
                ? "text-amber-700 border-b-2 border-amber-700 -mb-[2px]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => setActiveSection("products")}
        >
          <FaBox className="text-lg" /> Product Management
        </button>
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors relative whitespace-nowrap
            ${
              activeSection === "brands"
                ? "text-amber-700 border-b-2 border-amber-700 -mb-[2px]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => setActiveSection("brands")}
        >
          <FaTags className="text-lg" /> Brand Management
        </button>
        <button
          className={`flex items-center gap-2 py-3 px-6 font-medium text-sm transition-colors relative whitespace-nowrap
            ${
              activeSection === "categories"
                ? "text-amber-700 border-b-2 border-amber-700 -mb-[2px]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => setActiveSection("categories")}
        >
          <FaLayerGroup className="text-lg" /> Category Management
        </button>
      </div>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      {/* Products Section */}
      {activeSection === "products" && (
        <div className="products-section">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold flex items-center">
                <FaBox className="mr-2" /> Products
              </h3>
              <div className="ml-8 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <button
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center"
              onClick={() => {
                setSelectedProduct(null);
                setShowProductForm(true);
              }}
            >
              <FaPlus className="mr-2" /> Add Product
            </button>
          </div>

          {/* Product Form */}
          {showProductForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <ProductForm
                product={selectedProduct}
                onCancel={() => {
                  setShowProductForm(false);
                  setSelectedProduct(null);
                }}
                onSuccess={() => {
                  setShowProductForm(false);
                  setSelectedProduct(null);
                  fetchProducts();
                }}
              />
            </div>
          )}

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product._id || product.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : product.imageUrl ||
                                "/images/placeholder-product.jpg"
                          }
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            console.error(
                              "Image failed to load:",
                              product.images
                            );
                            e.target.src = "/images/placeholder-product.jpg";
                          }}
                        />
                      </td>
                      <td className="py-4 px-4">{product.name}</td>
                      <td className="py-4 px-4">${product.price.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        {product.category?.name || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        {product.brand?.name || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleEditProduct(product._id || product.id)
                            }
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit product"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteProduct(product._id || product.id)
                            }
                            className="text-red-500 hover:text-red-700"
                            title="Delete product"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() =>
                              window.open(
                                `/product/${product._id || product.id}`,
                                "_blank"
                              )
                            }
                            className="text-green-500 hover:text-green-700"
                            title="View product"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Brands Section */}
      {activeSection === "brands" && (
        <div className="brands-section">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold flex items-center">
                <FaTags className="mr-2" /> Brands
              </h3>
              <div className="ml-8 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={brandSearchQuery}
                  onChange={(e) => setBrandSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <button
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center"
              onClick={() => {
                setEditingBrand(null);
                setBrandFormData({
                  name: "",
                  description: "",
                  logoUrl: "",
                });
                setShowBrandForm(true);
              }}
            >
              <FaPlus className="mr-2" /> Add Brand
            </button>
          </div>{" "}
          {/* Brand Form Modal */}
          {showBrandForm && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-start justify-center pt-10 z-50"
              onClick={() => {
                setShowBrandForm(false);
                setEditingBrand(null);
                setBrandFormData({
                  name: "",
                  description: "",
                  logoUrl: "",
                });
                setBrandErrors({});
              }}
            >
              <div
                className="bg-white p-6 rounded-lg w-full max-w-lg mb-10"
                onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal when clicking inside
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {editingBrand ? "Edit Brand" : "Add New Brand"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowBrandForm(false);
                      setEditingBrand(null);
                      setBrandFormData({
                        name: "",
                        description: "",
                        logoUrl: "",
                      });
                      setBrandErrors({});
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleBrandSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={brandFormData.name}
                      onChange={handleBrandInputChange}
                      className={`w-full p-2 border rounded-md ${
                        brandErrors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter brand name"
                    />
                    {brandErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {brandErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={brandFormData.description}
                      onChange={handleBrandInputChange}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter brand description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo URL
                    </label>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          name="logoUrl"
                          value={brandFormData.logoUrl}
                          onChange={handleBrandInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Enter logo URL"
                        />
                      </div>
                      {/* Logo Preview */}
                      <div className="w-16 h-16 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center overflow-hidden">
                        {brandFormData.logoUrl ? (
                          <img
                            src={brandFormData.logoUrl}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                            onLoad={(e) => {
                              e.target.style.display = "block";
                              e.target.nextSibling.style.display = "none";
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full ${
                            brandFormData.logoUrl ? "hidden" : "flex"
                          } items-center justify-center text-xs text-gray-400`}
                        >
                          <div className="text-center">
                            <FaTags className="mx-auto mb-1 text-gray-300" />
                            <div>No Logo</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBrandForm(false);
                        setEditingBrand(null);
                        setBrandFormData({
                          name: "",
                          description: "",
                          logoUrl: "",
                        });
                        setBrandErrors({});
                      }}
                      className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-6 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    >
                      {editingBrand ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Brands Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500">
                      Loading brands...
                    </td>
                  </tr>
                ) : filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500">
                      No brands found.
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <tr
                      key={brand._id || brand.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="h-10 w-10 object-contain"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 flex items-center justify-center rounded">
                            <FaTags className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">{brand.name}</td>
                      <td className="py-4 px-4">
                        {brand.description && brand.description.length > 50
                          ? `${brand.description.substring(0, 50)}...`
                          : brand.description || "No description"}
                      </td>
                      <td className="py-4 px-4">{brand.productCount || 0}</td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditBrand(brand)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit brand"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteBrand(brand._id || brand.id)
                            }
                            className="text-red-500 hover:text-red-700"
                            title="Delete brand"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}{" "}
      {/* Categories Section */}
      {activeSection === "categories" && (
        <div className="categories-section">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <h3 className="text-xl font-semibold flex items-center">
                <FaLayerGroup className="mr-2" /> Categories
              </h3>
              <div className="ml-8 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Expand/Collapse All Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={expandAllCategories}
                  className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                  title="Expand all parent categories"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAllCategories}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Collapse all parent categories"
                >
                  Collapse All
                </button>
              </div>
              <button
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md flex items-center"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryFormData({
                    name: "",
                    description: "",
                    slug: "",
                    parent: "",
                  });
                  setShowCategoryForm(true);
                }}
              >
                <FaPlus className="mr-2" /> Add Category
              </button>
            </div>
          </div>{" "}
          {/* Category Form Modal */}
          {showCategoryForm && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-start justify-center pt-10 z-50"
              onClick={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
                setCategoryFormData({
                  name: "",
                  description: "",
                  slug: "",
                  parent: "",
                });
                setCategoryErrors({});
              }}
            >
              <div
                className="bg-white p-6 rounded-lg w-full max-w-lg mb-10"
                onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal when clicking inside
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCategoryForm(false);
                      setEditingCategory(null);
                      setCategoryFormData({
                        name: "",
                        description: "",
                        slug: "",
                        parent: "",
                      });
                      setCategoryErrors({});
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      className={`w-full p-2 border rounded-md ${
                        categoryErrors.name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter category name"
                    />
                    {categoryErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {categoryErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={categoryFormData.slug}
                      onChange={handleCategoryInputChange}
                      className={`w-full p-2 border rounded-md ${
                        categoryErrors.slug
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="category-slug"
                    />
                    {categoryErrors.slug && (
                      <p className="text-red-500 text-xs mt-1">
                        {categoryErrors.slug}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      URL-friendly version of the name (auto-generated from
                      name)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Category
                    </label>
                    <select
                      name="parent"
                      value={categoryFormData.parent}
                      onChange={handleCategoryInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {" "}
                      <option value="">None (Top Level Category)</option>
                      {sortCategoriesHierarchically(
                        getPotentialParentCategories()
                      ).map((category) => (
                        <option
                          key={category._id || category.id}
                          value={category._id || category.id}
                        >
                          {formatCategoryNameForDropdown(category)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={categoryFormData.description}
                      onChange={handleCategoryInputChange}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter category description (optional)"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                        setCategoryFormData({
                          name: "",
                          description: "",
                          slug: "",
                          parent: "",
                        });
                        setCategoryErrors({});
                      }}
                      className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-6 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    >
                      {editingCategory ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}{" "}
          {/* Categories Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-md">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Category
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500">
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  renderCategoriesWithDropdown()
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogManagement;
