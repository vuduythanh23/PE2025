import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../utils/api/products";
import { formatCurrency, isAuthenticated, addItemToCart } from "../utils";
import { useCart } from "../context/CartContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Swal from "sweetalert2";
import {
  getAvailableSizesForColor,
  getAvailableColorsForSize,
  isColorSizeAvailable,
} from "../utils/helpers/inventory";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateCartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  // Update available options when selections change
  useEffect(() => {
    if (!product) return;

    if (selectedColor) {
      const sizesForColor = getAvailableSizesForColor(
        product,
        selectedColor.color
      );
      setAvailableSizes(sizesForColor);

      // If current size is not available for selected color, reset it
      const currentSizeAvailable = sizesForColor.find(
        (s) => s.size === selectedSize?.size && s.isAvailable
      );
      if (selectedSize && !currentSizeAvailable) {
        const firstAvailableSize = sizesForColor.find((s) => s.isAvailable);
        setSelectedSize(
          firstAvailableSize
            ? {
                size: firstAvailableSize.size,
                stock: firstAvailableSize.availableStock,
              }
            : null
        );
      }
    } else {
      setAvailableSizes(
        product.sizes?.map((s) => ({ ...s, isAvailable: s.stock > 0 })) || []
      );
    }

    if (selectedSize) {
      const colorsForSize = getAvailableColorsForSize(
        product,
        selectedSize.size
      );
      setAvailableColors(colorsForSize);

      // If current color is not available for selected size, reset it
      const currentColorAvailable = colorsForSize.find(
        (c) => c.color === selectedColor?.color && c.isAvailable
      );
      if (selectedColor && !currentColorAvailable) {
        const firstAvailableColor = colorsForSize.find((c) => c.isAvailable);
        setSelectedColor(firstAvailableColor || null);
      }
    } else {
      setAvailableColors(
        product.colors?.map((c) => ({ ...c, isAvailable: c.stock > 0 })) || []
      );
    }
  }, [selectedColor, selectedSize, product]);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);

        // Set defaults
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
          if (
            productData.colors[0].images &&
            productData.colors[0].images.length > 0
          ) {
            setCurrentImage(productData.colors[0].images[0]);
          } else {
            setCurrentImage(
              productData.images?.[0] || "/images/placeholder-product.jpg"
            );
          }
        } else {
          setCurrentImage(
            productData.images?.[0] || "/images/placeholder-product.jpg"
          );
        }

        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
  // Handle color selection with inventory constraints
  const handleColorSelect = (color) => {
    const colorData = availableColors.find((c) => c.color === color.color);
    if (colorData && colorData.isAvailable) {
      setSelectedColor(color);
      if (color.images && color.images.length > 0) {
        setCurrentImage(color.images[0]);
      }
    }
  };

  // Handle size selection with inventory constraints
  const handleSizeSelect = (size) => {
    const sizeData = availableSizes.find((s) => s.size === size.size);
    if (sizeData && sizeData.isAvailable) {
      setSelectedSize(size);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      const result = await Swal.fire({
        title: "Login Required",
        text: "You need to login before adding items to your cart",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login",
        cancelButtonText: "Cancel",
        backdrop: "rgba(0, 0, 0, 0.7)",
      });

      if (result.isConfirmed) {
        navigate("/login?redirect=/products");
      }
      return;
    } // Validate selections
    if (product.sizes?.length > 0 && !selectedSize) {
      await Swal.fire({
        title: "Please Select a Size",
        text: "You need to select a size before adding to cart",
        icon: "warning",
      });
      return;
    }

    if (product.colors?.length > 0 && !selectedColor) {
      await Swal.fire({
        title: "Please Select a Color",
        text: "You need to select a color before adding to cart",
        icon: "warning",
      });
      return;
    }

    // Validate color-size combination if both are selected
    if (
      selectedColor &&
      selectedSize &&
      !isColorSizeAvailable(product, selectedColor.color, selectedSize.size)
    ) {
      await Swal.fire({
        title: "Invalid Combination",
        text: "This color and size combination is not available",
        icon: "warning",
      });
      return;
    }
    try {
      await addItemToCart({
        productId: product._id,
        quantity: 1,
        selectedSize: selectedSize?.size || null,
        selectedColor: selectedColor?.color || null,
      });

      updateCartItems();

      await Swal.fire({
        title: "Added to Cart!",
        text: "Product has been added to your cart",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      await Swal.fire({
        title: "Error",
        text: "Failed to add product to cart. Please try again.",
        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-light">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="text-xl text-luxury-gold/50 font-serif">
            Loading product details...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-luxury-light">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif text-luxury-dark mb-4">
            Product Not Found
          </h1>
          <p className="text-luxury-dark/70 mb-8">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-luxury-gold text-white px-6 py-3 rounded-md font-serif text-sm tracking-wider hover:bg-luxury-dark transition-colors"
          >
            Back to Products
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-light">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/images/placeholder-product.jpg";
                }}
              />
            </div>

            {/* Thumbnail images */}
            {selectedColor?.images && selectedColor.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {selectedColor.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImage === img
                        ? "border-luxury-gold"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-serif text-luxury-dark mb-2">
                {product.name}
              </h1>
              <p className="text-xl text-luxury-gold font-medium">
                {typeof product.brand === "object"
                  ? product.brand.name
                  : product.brand}
              </p>
            </div>
            <div className="text-3xl font-serif text-luxury-gold">
              {formatCurrency(product.price)}
            </div>
            {product.description && (
              <div>
                <h3 className="text-lg font-serif text-luxury-dark mb-2">
                  Description
                </h3>
                <p className="text-luxury-dark/70 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}{" "}
            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-serif text-luxury-dark mb-3">
                  Choose Color
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color, index) => {
                    const colorData =
                      availableColors.find((c) => c.color === color.color) ||
                      color;
                    const isAvailable = colorData.isAvailable;

                    return (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(color)}
                        disabled={!isAvailable}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                          selectedColor?.color === color.color
                            ? "border-luxury-gold bg-luxury-gold bg-opacity-10 text-luxury-gold"
                            : "border-gray-200 text-gray-600 hover:border-luxury-gold"
                        } ${
                          isAvailable
                            ? ""
                            : "opacity-40 cursor-not-allowed bg-gray-50"
                        }`}
                      >
                        {color.hexcode && (
                          <div
                            className="w-5 h-5 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.hexcode }}
                          />
                        )}
                        <span className="font-medium">{color.color}</span>
                        {color.stock !== undefined && (
                          <span
                            className={`text-sm ${
                              isAvailable ? "text-gray-500" : "text-red-400"
                            }`}
                          >
                            (
                            {isAvailable
                              ? `${
                                  colorData.availableStock || color.stock
                                } left`
                              : "Not available"}
                            )
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}{" "}
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-serif text-luxury-dark mb-3">
                  Choose Size
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes.map((size, index) => {
                    const sizeData =
                      availableSizes.find((s) => s.size === size.size) || size;
                    const isAvailable = sizeData.isAvailable;

                    return (
                      <button
                        key={index}
                        onClick={() => handleSizeSelect(size)}
                        disabled={!isAvailable}
                        className={`w-16 h-16 text-sm font-serif rounded-lg border transition-all ${
                          selectedSize?.size === size.size
                            ? "bg-luxury-gold text-white border-luxury-gold"
                            : "border-gray-200 text-luxury-dark hover:border-luxury-gold"
                        } ${
                          isAvailable
                            ? "transform hover:scale-105"
                            : "opacity-40 cursor-not-allowed bg-gray-100"
                        }`}
                        title={`Size ${size.size}${
                          !isAvailable ? " (Not available)" : ""
                        }`}
                      >
                        {size.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Add to Cart Button */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-4 px-6 rounded-lg font-serif text-lg tracking-wider transition-all ${
                  product.stock > 0
                    ? "bg-luxury-gold text-white hover:bg-luxury-dark"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>

              <button
                onClick={() => navigate("/products")}
                className="px-6 py-4 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
