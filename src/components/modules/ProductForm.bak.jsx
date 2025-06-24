import React, { useState, useEffect } from "react";
import { createProduct, updateProduct } from "../../utils/api/products";
import { getCategories } from "../../utils/api/categories";
import { getBrands } from "../../utils/api/brands";
import {
  createLocalFileURL,
  uploadFiles,
} from "../../utils/helpers/fileUpload";

const ProductForm = ({ product, onClose, onSuccess }) => {
  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    images: [],
    sizes: [],
    colors: [],
    status: "available",
    isNewArrival: false,
    isExclusive: false,
    onSale: false,
    salePrice: "",
  });

  // State for image URL input
  const [imageUrl, setImageUrl] = useState("");
  const [colorImageUrl, setColorImageUrl] = useState("");
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  // State for validation errors
  const [errors, setErrors] = useState({});

  // State for loading
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State for categories and brands dropdowns
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  // Load data on component mount
  useEffect(() => {
    const loadFormDependencies = async () => {
      setLoading(true);
      try {
        // Fetch categories and brands for dropdowns
        const [categoriesData, brandsData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);

        setCategories(categoriesData);
        setBrands(brandsData);

        // If editing mode, populate form with product data
        if (product) {
          const sizesArray = product.sizes
            ? product.sizes.map((s) => ({
                size: s.size,
                stock: s.stock,
              }))
            : [];

          const colorsArray = product.colors
            ? product.colors.map((c) => ({
                color: c.color,
                hexcode: c.hexcode,
                stock: c.stock,
                images: (c.images || []).map((img) => ({
                  preview: img,
                  isNew: false,
                })),
              }))
            : [];

          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            category: product.category?._id || "",
            brand: product.brand?._id || "",
            stock: product.stock || 0,
            images: (product.images || []).map((img) => ({
              preview: img,
              isNew: false,
            })),
            sizes: sizesArray,
            colors: colorsArray,
            status: product.status || "available",
            isNewArrival: product.isNewArrival || false,
            isExclusive: product.isExclusive || false,
            onSale: product.onSale || false,
            salePrice: product.salePrice || "",
          });
        }
      } catch (err) {
        console.error("Error loading form dependencies:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFormDependencies();
  }, [product]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox inputs
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
      return;
    }

    // Handle number inputs
    if (type === "number") {
      setFormData({ ...formData, [name]: value === "" ? "" : Number(value) });
      return;
    }

    // Handle other inputs
    setFormData({ ...formData, [name]: value });
  };

  // Handle size operations
  const handleAddSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { size: "", stock: 0 }],
    });
  };

  const handleRemoveSize = (index) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes.splice(index, 1);
    setFormData({ ...formData, sizes: updatedSizes });
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...formData.sizes];

    if (field === "stock") {
      updatedSizes[index][field] = value === "" ? 0 : Number(value);
    } else {
      updatedSizes[index][field] = value;
    }

    setFormData({ ...formData, sizes: updatedSizes });
  };

  // Handle color operations
  const handleAddColor = () => {
    setFormData({
      ...formData,
      colors: [
        ...formData.colors,
        { color: "", hexcode: "", stock: 0, images: [] },
      ],
    });
  };

  const handleRemoveColor = (index) => {
    const updatedColors = [...formData.colors];
    updatedColors.splice(index, 1);
    setFormData({ ...formData, colors: updatedColors });
  };

  const handleColorChange = (index, field, value) => {
    const updatedColors = [...formData.colors];

    if (field === "stock") {
      updatedColors[index][field] = value === "" ? 0 : Number(value);
    } else {
      updatedColors[index][field] = value;
    }

    setFormData({ ...formData, colors: updatedColors });
  };
  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Create temporary URLs for preview
    const imageURLs = files.map((file) => ({
      file,
      preview: createLocalFileURL(file),
      isNew: true,
    }));

    setFormData({
      ...formData,
      images: [...formData.images, ...imageURLs],
    });
  };
  // Handle color image upload
  const handleColorImageUpload = (e, colorIndex) => {
    const files = Array.from(e.target.files);
    const imageURLs = files.map((file) => ({
      file,
      preview: createLocalFileURL(file),
      isNew: true,
    }));

    const updatedColors = [...formData.colors];
    updatedColors[colorIndex].images = [
      ...updatedColors[colorIndex].images,
      ...imageURLs,
    ];

    setFormData({ ...formData, colors: updatedColors });
  };

  // Handle image URL input for main product images
  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;

    // Validate URL format
    if (!isValidUrl(imageUrl)) {
      setErrors({ ...errors, imageUrl: "Please enter a valid URL" });
      return;
    }

    // Add the URL to product images
    setFormData({
      ...formData,
      images: [...formData.images, { preview: imageUrl, isNew: false }],
    });

    // Clear input field
    setImageUrl("");

    // Clear any previous errors
    if (errors.imageUrl) {
      const { imageUrl, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  // Handle image URL input for color variants
  const handleAddColorImageUrl = () => {
    if (!colorImageUrl.trim() || currentColorIndex === null) return;

    // Validate URL format
    if (!isValidUrl(colorImageUrl)) {
      setErrors({ ...errors, colorImageUrl: "Please enter a valid URL" });
      return;
    }

    // Add the URL to the selected color's images
    const updatedColors = [...formData.colors];
    updatedColors[currentColorIndex].images = [
      ...updatedColors[currentColorIndex].images,
      { preview: colorImageUrl, isNew: false },
    ];

    setFormData({ ...formData, colors: updatedColors });

    // Clear input field
    setColorImageUrl("");

    // Clear any previous errors
    if (errors.colorImageUrl) {
      const { colorImageUrl, ...restErrors } = errors;
      setErrors(restErrors);
    }
  };

  // Helper function to validate URLs
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Cleanup effect to revoke object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up main images
      formData.images.forEach((img) => {
        if (img.isNew && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });

      // Clean up color images
      formData.colors.forEach((color) => {
        color.images.forEach((img) => {
          if (img.isNew && img.preview) {
            URL.revokeObjectURL(img.preview);
          }
        });
      });
    };
  }, []);
  // Remove image
  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.images];
    const removedImage = updatedImages[index];

    // If this is a new image with a local preview URL, revoke it to prevent memory leaks
    if (removedImage.isNew && removedImage.preview) {
      URL.revokeObjectURL(removedImage.preview);
    }

    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
  };

  // Remove color image
  const handleRemoveColorImage = (colorIndex, imageIndex) => {
    const updatedColors = [...formData.colors];
    const removedImage = updatedColors[colorIndex].images[imageIndex];

    // If this is a new image with a local preview URL, revoke it to prevent memory leaks
    if (removedImage.isNew && removedImage.preview) {
      URL.revokeObjectURL(removedImage.preview);
    }

    updatedColors[colorIndex].images.splice(imageIndex, 1);
    setFormData({ ...formData, colors: updatedColors });
  };
  // Validate form before submission
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      tempErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      tempErrors.description = "Description is required";
      isValid = false;
    }

    if (!formData.price || formData.price <= 0) {
      tempErrors.price = "Valid price is required";
      isValid = false;
    }

    if (!formData.category) {
      tempErrors.category = "Category is required";
      isValid = false;
    }

    if (!formData.brand) {
      tempErrors.brand = "Brand is required";
      isValid = false;
    }

    if (formData.stock < 0) {
      tempErrors.stock = "Stock cannot be negative";
      isValid = false;
    } // Ensure at least one product image
    if (formData.images.length === 0) {
      tempErrors.images = "At least one product image is required";
      isValid = false;
    }

    // Validate all image URLs
    const invalidImageUrls = formData.images.filter(
      (img) => !img.file && !isValidUrl(img.preview)
    );
    if (invalidImageUrls.length > 0) {
      tempErrors.images = "One or more image URLs are invalid";
      isValid = false;
    }

    if (formData.onSale && (!formData.salePrice || formData.salePrice <= 0)) {
      tempErrors.salePrice = "Valid sale price is required";
      isValid = false;
    }

    // Check if sale price is lower than regular price
    if (
      formData.onSale &&
      Number(formData.salePrice) >= Number(formData.price)
    ) {
      tempErrors.salePrice = "Sale price must be lower than regular price";
      isValid = false;
    }

    // Validate sizes
    const sizesValid = formData.sizes.every((size, index) => {
      if (!size.size) {
        tempErrors[`size_${index}`] = "Size name is required";
        isValid = false;
        return false;
      }
      if (size.stock < 0) {
        tempErrors[`sizeStock_${index}`] = "Stock cannot be negative";
        isValid = false;
        return false;
      }
      return true;
    });

    // Validate colors
    const colorsValid = formData.colors.every((color, index) => {
      if (!color.color) {
        tempErrors[`color_${index}`] = "Color name is required";
        isValid = false;
        return false;
      }
      if (!color.hexcode) {
        tempErrors[`hexcode_${index}`] = "Hex code is required";
        isValid = false;
        return false;
      }
      if (color.stock < 0) {
        tempErrors[`colorStock_${index}`] = "Stock cannot be negative";
        isValid = false;
        return false;
      }
      return true;
    });

    setErrors(tempErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    console.log("Form submission started");
    console.log("Original form data:", {
      ...formData,
      images: formData.images.map(img => ({
        isNew: img.isNew,
        hasFile: !!img.file,
        preview: img.preview
      }))
    });    try {
      // Process main product images
      // For CDN links, we just need the preview URL
      // For uploaded files that are new, we still need to process them
      
      // Extract file objects that need to be uploaded
      const newMainImages = formData.images
        .filter((img) => img.isNew && img.file)
        .map((img) => img.file);
      
      // Keep track of images that are already URLs (don't need upload)
      let mainImageUrls = formData.images.filter(
        (img) => !img.isNew || !img.file
      );
      
      console.log("Files to upload:", newMainImages.length);
      console.log("Existing image URLs:", mainImageUrls.length);
      
      // Upload new main images if there are any file uploads
      if (newMainImages.length > 0) {
        try {
          console.log("Uploading main product images...");
          const uploadedMainUrls = await uploadFiles(newMainImages, "product");
          console.log("Upload successful, received URLs:", uploadedMainUrls);
          
          // Add the new uploaded URLs to our collection
          mainImageUrls = [
            ...mainImageUrls,
            ...uploadedMainUrls.map((url) => ({ preview: url })),
          ];
          
          console.log("Updated mainImageUrls after upload:", mainImageUrls.length);
        } catch (error) {
          console.error("Error uploading main images:", error);
          setErrors({ submit: `Failed to upload images: ${error.message}` });
          throw new Error(`Failed to upload product images: ${error.message}`);
        }
      } else {
        console.log("No new main images to upload");
      }      // Handle color images - similar approach for both CDN links and file uploads
      const updatedColors = await Promise.all(
        formData.colors.map(async (color) => {
          // Extract files that need to be uploaded for this color
          const newColorImages = color.images
            .filter((img) => img.isNew && img.file)
            .map((img) => img.file);
          
          // Extract URLs that are already available (don't need upload)
          let colorImageUrls = color.images
            .filter((img) => !img.isNew || !img.file)
            .map((img) => {
              // If it's already a string URL, use it directly
              if (typeof img === 'string') return img;
              // If it has a preview, use that
              if (img.preview) return img.preview;
              // Fallback case (shouldn't happen)
              console.warn('Unexpected image format:', img);
              return null;
            })
            .filter(Boolean); // Remove any nulls
            
          console.log(`Color ${color.color}: ${newColorImages.length} files to upload, ${colorImageUrls.length} existing URLs`);
          
          // Upload new color images if any
          if (newColorImages.length > 0) {
            try {
              console.log(`Uploading ${newColorImages.length} images for color: ${color.color}`);
              const uploadedColorUrls = await uploadFiles(
                newColorImages,
                "product"
              );
              console.log(`Successfully uploaded color images, got URLs:`, uploadedColorUrls);
              
              // Add the new URL strings directly to our collection
              colorImageUrls = [...colorImageUrls, ...uploadedColorUrls];
              console.log(`Updated colorImageUrls after upload:`, colorImageUrls);
            } catch (error) {
              console.error("Error uploading color images:", error);
              setErrors({ submit: `Failed to upload color images: ${error.message}` });
              throw new Error(
                `Failed to upload images for color ${color.color}: ${error.message}`
              );
            }
          } else {
            console.log(`No new images to upload for color: ${color.color}`);
          }

          return {
            ...color,
            images: colorImageUrls,          };
        })
      );
      
      // Prepare data for API
      console.log("Processing mainImageUrls:", mainImageUrls);
        // Process main images - ensure we extract just the URL strings
      const processedMainImages = mainImageUrls.map((img) => {
        // Case 1: Direct string URL
        if (typeof img === "string") return img;
        
        // Case 2: Object with preview property
        if (img && img.preview) return img.preview;
        
        // Case 3: Unknown format - log and skip
        console.warn("Skipping invalid image format:", img);
        return null;
      }).filter(url => url); // Remove any nulls
      
      console.log("Processed main images:", processedMainImages);
      
      // Process color images - ensure they're also just URL strings
      const processedColors = updatedColors.map(color => {
        let processedColorImages = [];
        
        if (Array.isArray(color.images)) {
          // Convert all image references to simple URL strings
          processedColorImages = color.images
            // Filter out any null/undefined values
            .filter(img => img != null)
            // Convert to string URLs
            .map(img => {
              if (typeof img === "string") return img;
              if (img && img.preview) return img.preview;
              console.warn("Skipping invalid color image format:", img);
              return null;
            })
            // Remove any nulls from the mapping
            .filter(url => url);
        }
        
        // Only keep relevant color properties for the API
        return {
          color: color.color,
          hexcode: color.hexcode,
          stock: Number(color.stock || 0),
          images: processedColorImages
        };
      });
      
      console.log("Processed colors:", processedColors);
      
      const productData = {
        ...formData,
        images: processedMainImages,
        colors: processedColors,
        price: Number(formData.price),
        stock: Number(formData.stock),
        salePrice:
          formData.onSale && formData.salePrice
            ? Number(formData.salePrice)
            : undefined,      };

      // Create or update the product
      console.log("Final product data being sent to API:", JSON.stringify(productData, null, 2));
      
      let result;
      if (product) {
        console.log("Updating existing product with ID:", product._id);
        result = await updateProduct(product._id, productData);
        console.log("Product updated successfully:", result);
      } else {
        console.log("Creating new product");
        result = await createProduct(productData);
        console.log("Product created successfully:", result);      }

      onSuccess();
    } catch (err) {
      console.error("Error submitting product:", err);
      
      // Set a more descriptive error message
      let errorMessage = "Failed to save product. Please try again.";
      
      // Extract specific error messages if available
      if (err.message) {
        // Check for common error patterns
        if (err.message.includes("Failed to upload")) {
          errorMessage = `Upload error: ${err.message}`;
        } else if (err.message.includes("Failed to create product")) {
          errorMessage = `API error: ${err.message}`;
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      setErrors({ submit: errorMessage });
      alert(`Error: ${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg w-full max-w-4xl">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            <p className="mt-2 text-gray-600">Loading form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-start justify-center pt-10 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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

        {errors.submit && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className={`w-full p-2 border rounded-md ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full p-2 border rounded-md ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.brand ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1">{errors.brand}</p>
                )}
              </div>
            </div>
          </div>
          {/* Section 2: Variants */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Variants</h3>

            {/* General Stock */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">
                General Stock
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full p-2 border rounded-md ${
                    errors.stock ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  This is the main stock value. It should align with the sum of
                  individual size and color stocks.
                </p>
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-medium text-gray-700">
                  Sizes (Optional)
                </h4>
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="text-amber-500 hover:text-amber-600 text-sm flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Size
                </button>
              </div>

              {formData.sizes.length > 0 ? (
                formData.sizes.map((size, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 mb-2 p-2 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Size
                      </label>
                      <input
                        type="text"
                        value={size.size}
                        onChange={(e) =>
                          handleSizeChange(index, "size", e.target.value)
                        }
                        placeholder="e.g., S, M, L"
                        className={`w-full p-2 border rounded-md ${
                          errors[`size_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors[`size_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`size_${index}`]}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={size.stock}
                        onChange={(e) =>
                          handleSizeChange(index, "stock", e.target.value)
                        }
                        min="0"
                        className={`w-full p-2 border rounded-md ${
                          errors[`sizeStock_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors[`sizeStock_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`sizeStock_${index}`]}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      className="p-1 text-red-500 hover:text-red-700 self-end mb-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No sizes added</p>
              )}
            </div>

            {/* Colors */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-medium text-gray-700">
                  Colors (Optional)
                </h4>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="text-amber-500 hover:text-amber-600 text-sm flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Color
                </button>
              </div>

              {formData.colors.length > 0 ? (
                formData.colors.map((color, index) => (
                  <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-end justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-700">
                        Color #{index + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Color Name
                        </label>
                        <input
                          type="text"
                          value={color.color}
                          onChange={(e) =>
                            handleColorChange(index, "color", e.target.value)
                          }
                          placeholder="e.g., Red, Blue"
                          className={`w-full p-2 border rounded-md ${
                            errors[`color_${index}`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`color_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`color_${index}`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Hex Code
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={color.hexcode}
                            onChange={(e) =>
                              handleColorChange(
                                index,
                                "hexcode",
                                e.target.value
                              )
                            }
                            placeholder="e.g., #FF0000"
                            className={`flex-1 p-2 border rounded-md ${
                              errors[`hexcode_${index}`]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          <input
                            type="color"
                            value={color.hexcode}
                            onChange={(e) =>
                              handleColorChange(
                                index,
                                "hexcode",
                                e.target.value
                              )
                            }
                            className="h-10 w-10 border border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        {errors[`hexcode_${index}`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`hexcode_${index}`]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock for this Color
                      </label>
                      <input
                        type="number"
                        value={color.stock}
                        onChange={(e) =>
                          handleColorChange(index, "stock", e.target.value)
                        }
                        min="0"
                        className={`w-full p-2 border rounded-md ${
                          errors[`colorStock_${index}`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors[`colorStock_${index}`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`colorStock_${index}`]}
                        </p>
                      )}
                    </div>

                    <div>
                      {" "}
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Images for this Color
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Please use CDN links for product images.
                      </p>
                      {/* Image URL Input for this color */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Add Image by URL
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={colorImageUrl}
                            onChange={(e) => {
                              setColorImageUrl(e.target.value);
                              setCurrentColorIndex(index);
                            }}
                            placeholder="Enter image URL (https://...)"
                            className={`flex-1 p-2 border rounded-md ${
                              errors.colorImageUrl
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleAddColorImageUrl}
                            className="bg-amber-500 text-white px-3 py-1 rounded-md text-sm hover:bg-amber-600"
                          >
                            Add
                          </button>
                        </div>
                        {errors.colorImageUrl &&
                          index === currentColorIndex && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.colorImageUrl}
                            </p>
                          )}
                      </div>
                      {/* File Upload (retain for backward compatibility) */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          <span className="text-amber-600">(Legacy)</span> File
                          Upload Option
                        </label>
                        <input
                          type="file"
                          onChange={(e) => handleColorImageUpload(e, index)}
                          multiple
                          accept="image/*"
                          className="w-full p-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {color.images.map((img, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative h-16 w-16 border rounded overflow-hidden"
                          >
                            <img
                              src={img.preview || img}
                              alt={`Color ${index + 1} preview ${imgIndex + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveColorImage(index, imgIndex)
                              }
                              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl text-xs"
                            >
                              ×
                            </button>
                            {img.isNew && (
                              <span className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs py-1 text-center">
                                New
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No colors added</p>
              )}
            </div>
          </div>
          {/* Section 3: Images */}{" "}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Product Images
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Product Images
              </label>

              <p className="text-xs text-gray-500 mb-2">
                We now use CDN links for images. Please provide direct image
                URLs rather than uploading files.
              </p>

              {/* Image URL Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Image by URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL (https://...)"
                    className={`flex-1 p-2 border rounded-md ${
                      errors.imageUrl ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
                  >
                    Add
                  </button>
                </div>
                {errors.imageUrl && (
                  <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>
                )}{" "}
              </div>

              {/* File Upload Input (retain for backward compatibility) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="text-amber-600">(Legacy)</span> File Upload
                  Option
                </label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  className="w-full p-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500"
                />
              </div>

              {/* Image Previews */}
              <div className="flex flex-wrap gap-3 mt-3">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative h-24 w-24 border rounded overflow-hidden"
                  >
                    <img
                      src={img.preview || img}
                      alt={`Product preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl text-xs"
                    >
                      ×
                    </button>
                    {img.isNew && (
                      <span className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs py-1 text-center">
                        New
                      </span>
                    )}
                  </div>
                ))}
                {formData.images.length === 0 && (
                  <div className="text-sm text-gray-500 italic">
                    No images added
                  </div>
                )}
              </div>
              {errors.images && (
                <p className="text-red-500 text-xs mt-1">{errors.images}</p>
              )}
            </div>
          </div>
          {/* Section 4: Tags and Status */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Tags and Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isNewArrival"
                  name="isNewArrival"
                  checked={formData.isNewArrival}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                />
                <label
                  htmlFor="isNewArrival"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Is New Arrival
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isExclusive"
                  name="isExclusive"
                  checked={formData.isExclusive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                />
                <label
                  htmlFor="isExclusive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Is Exclusive
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="onSale"
                  name="onSale"
                  checked={formData.onSale}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                />
                <label
                  htmlFor="onSale"
                  className="ml-2 block text-sm text-gray-700"
                >
                  On Sale
                </label>
              </div>

              {formData.onSale && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full p-2 border rounded-md ${
                      errors.salePrice ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.salePrice && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.salePrice}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="available">Available</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>
          </div>
          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`py-2 px-6 bg-amber-500 text-white rounded-md hover:bg-amber-600 ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : product ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
