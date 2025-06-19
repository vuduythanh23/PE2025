import React, { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../utils/api/categories";
import { getProducts } from "../../utils/api/products";
import Swal from "sweetalert2";
import { useLoading } from "../../context/LoadingContext";

const CategoryManagement = ({ onDataChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [errors, setErrors] = useState({});
  const { handleAsyncOperation } = useLoading();

  // Add ESC key handler to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showForm) {
        resetForm();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showForm]);

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch all categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch both categories and products to calculate product counts
      const [categoriesData, productsData] = await Promise.all([
        handleAsyncOperation(() => getCategories(), "Fetching categories"),
        handleAsyncOperation(
          () => getProducts({}, true), // forceLoadAll = true cho admin
          "Fetching products for counts"
        ),
      ]);

      // Validate and normalize categories data
      const categoriesArray = Array.isArray(categoriesData)
        ? categoriesData
        : [];

      // Process products to count by category
      const productsByCategory = {};
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
              if (!productsByCategory[categoryId]) {
                productsByCategory[categoryId] = 0;
              }
              // Increment the counter
              productsByCategory[categoryId]++;
            }
          }
        });
      }

      // Add product count to each category
      const categoriesWithCounts = categoriesArray.map((category) => {
        const categoryId = category._id || category.id;
        return {
          ...category,
          productCount: productsByCategory[categoryId] || 0,
        };
      });

      setCategories(categoriesWithCounts);
    } catch (err) {
      console.error("Error fetching categories:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to load categories. Please try again.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      // Auto-generate slug when name changes (only if not editing)
      setFormData({
        ...formData,
        [name]: value,
        ...(editingCategory ? {} : { slug: generateSlug(value) }),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Function to validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    // Check for duplicate slug (excluding current category when editing)
    const duplicateSlug = categories.find(
      (cat) =>
        cat.slug === formData.slug &&
        (!editingCategory || cat._id !== editingCategory._id)
    );
    if (duplicateSlug) {
      newErrors.slug = "This slug already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        slug: formData.slug.trim(),
      };

      if (editingCategory) {
        await updateCategory(editingCategory._id, categoryData);
        Swal.fire({
          title: "Success",
          text: "Category updated successfully!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createCategory(categoryData);
        Swal.fire({
          title: "Success",
          text: "Category created successfully!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      // Reset form and refresh data
      resetForm();
      fetchCategories();
      if (onDataChange) {
        onDataChange();
      }
    } catch (err) {
      console.error("Error saving category:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to save category. Please try again.",
        icon: "error",
      });
    }
  };

  // Function to reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      slug: "",
    });
    setEditingCategory(null);
    setShowForm(false);
    setErrors({});
  };

  // Function to handle editing a category
  const handleEdit = (category) => {
    setFormData({
      name: category.name || "",
      description: category.description || "",
      slug: category.slug || "",
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  // Function to handle deleting a category
  const handleDelete = async (id, name) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `You are about to delete "${name}". This action cannot be undone!`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await deleteCategory(id);
        await Swal.fire({
          title: "Deleted!",
          text: "Category has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchCategories();
        if (onDataChange) {
          onDataChange();
        }
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to delete category. Please try again.",
        icon: "error",
      });
    }
  };

  return (
    <div className="category-management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Category Management
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add New Category
        </button>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={resetForm}
        >
          <div
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal when clicking inside
          >
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={resetForm}
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
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter category name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.slug ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="category-slug"
                  />
                  {errors.slug && (
                    <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    URL-friendly version of the name (auto-generated from name)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter category description (optional)"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
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
        </div>
      )}

      {/* Categories Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          <p className="mt-2 text-gray-600">Loading categories...</p>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {category.productCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString()
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(category._id, category.name)
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
