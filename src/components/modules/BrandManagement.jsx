import React, { useState, useEffect } from "react";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../utils/api/brands";
import { getProducts } from "../../utils/api/products";
import Swal from "sweetalert2";
import { useLoading } from "../../context/LoadingContext";

const BrandManagement = ({ onDataChange }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
  });
  const [errors, setErrors] = useState({});
  const { handleAsyncOperation } = useLoading();

  // Add ESC key handler to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showForm) {
        resetForm();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showForm]);

  // Fetch all brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);
  
  // Function to fetch all brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      // Fetch both brands and products to calculate product counts
      const [brandsData, productsData] = await Promise.all([
        handleAsyncOperation(() => getBrands(), "Fetching brands"),
        handleAsyncOperation(() => getProducts({}, true), "Fetching products for counts") // forceLoadAll = true cho admin
      ]);
      
      // Validate and normalize brands data
      const brandsArray = Array.isArray(brandsData) ? brandsData : [];
      
      // Process products to count by brand
      const productsByBrand = {};
      if (Array.isArray(productsData)) {
        productsData.forEach(product => {
          if (product && product.brand) {
            // Extract brand ID based on whether it's an object or string
            const brandId = typeof product.brand === 'object' ? 
              (product.brand._id || product.brand.id) : product.brand;
            
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
      const brandsWithCounts = brandsArray.map(brand => {
        const brandId = brand._id || brand.id;
        return {
          ...brand,
          productCount: productsByBrand[brandId] || 0
        };
      });
      
      setBrands(brandsWithCounts);
    } catch (err) {
      console.error("Error fetching brands:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to load brands. Please try again.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Function to validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Brand name is required";
    }

    if (formData.logoUrl && !isValidUrl(formData.logoUrl)) {
      newErrors.logoUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const brandData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        logoUrl: formData.logoUrl.trim(),
      };

      if (editingBrand) {
        await updateBrand(editingBrand._id, brandData);
        Swal.fire({
          title: "Success",
          text: "Brand updated successfully!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await createBrand(brandData);
        Swal.fire({
          title: "Success",
          text: "Brand created successfully!",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }

      // Reset form and refresh data
      resetForm();
      fetchBrands();
      if (onDataChange) {
        onDataChange();
      }
    } catch (err) {
      console.error("Error saving brand:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to save brand. Please try again.",
        icon: "error",
      });
    }
  };

  // Function to reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      logoUrl: "",
    });
    setEditingBrand(null);
    setShowForm(false);
    setErrors({});
  };

  // Function to handle editing a brand
  const handleEdit = (brand) => {
    setFormData({
      name: brand.name || "",
      description: brand.description || "",
      logoUrl: brand.logoUrl || "",
    });
    setEditingBrand(brand);
    setShowForm(true);
  };

  // Function to handle deleting a brand
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
        await deleteBrand(id);
        await Swal.fire({
          title: "Deleted!",
          text: "Brand has been deleted successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchBrands();
        if (onDataChange) {
          onDataChange();
        }
      }
    } catch (err) {
      console.error("Error deleting brand:", err);
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to delete brand. Please try again.",
        icon: "error",
      });
    }
  };

  return (
    <div className="brand-management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Brand Management
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add New Brand
        </button>
      </div>      {/* Brand Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-start justify-center pt-10 z-50"
          onClick={resetForm}
        >
          <div 
            className="bg-white p-6 rounded-lg w-full max-w-lg mb-10"
            onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal when clicking inside
          >            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </h2>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter brand name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
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
                    placeholder="Enter brand description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    name="logoUrl"
                    value={formData.logoUrl}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.logoUrl ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter logo URL"
                  />
                  {errors.logoUrl && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.logoUrl}
                    </p>
                  )}

                  {/* Logo Preview */}
                  {formData.logoUrl && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Logo Preview:
                      </p>
                      <div className="flex items-center justify-center w-20 h-20 border-2 border-gray-200 rounded-lg bg-gray-50">
                        <img
                          src={formData.logoUrl}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                          onLoad={(e) => {
                            e.target.style.display = "block";
                            e.target.nextElementSibling.style.display = "none";
                          }}
                        />
                        <div
                          className="flex items-center justify-center w-full h-full text-gray-400 text-xs text-center"
                          style={{ display: "none" }}
                        >
                          Invalid URL
                        </div>
                      </div>
                    </div>
                  )}
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
                    {editingBrand ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Brands Table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          <p className="mt-2 text-gray-600">Loading brands...</p>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
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
              {brands.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No brands found
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded border overflow-hidden bg-gray-100">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`h-full w-full ${
                            brand.logoUrl ? "hidden" : "flex"
                          } items-center justify-center text-xs text-gray-500`}
                        >
                          No Logo
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {brand.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {brand.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {brand.productCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {brand.createdAt
                          ? new Date(brand.createdAt).toLocaleDateString()
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(brand._id, brand.name)}
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

export default BrandManagement;
