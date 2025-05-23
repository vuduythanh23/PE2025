import { formatCurrency } from "../../utils/format-utils";
import { useState } from "react";
import { addToCart } from "../../utils/cart-utils";
import Swal from "sweetalert2";

export default function ProductCard({
  _id,
  name,
  description,
  price,
  images,
  category,
  brand,
  colors,
  sizes,
  stock,
  averageRating,
}) {
  const [selectedColor, setSelectedColor] = useState(
    colors?.[0]?.color || null
  );
  const [selectedSize, setSelectedSize] = useState(sizes?.[0]?.size || null);

  const handleAddToCart = () => {
    if (!selectedSize && sizes?.length > 0) {
      Swal.fire({
        title: "Please Select Size",
        text: "You need to select a size before adding to cart",
        icon: "warning",
      });
      return;
    }

    if (!selectedColor && colors?.length > 0) {
      Swal.fire({
        title: "Please Select Color",
        text: "You need to select a color before adding to cart",
        icon: "warning",
      });
      return;
    }

    addToCart({ _id, name, price, images }, 1, selectedSize, selectedColor);

    Swal.fire({
      title: "Added to Cart!",
      text: "The item has been added to your cart",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={images?.[0] || "https://via.placeholder.com/300"}
          alt={name}
          className="w-full h-64 object-cover"
        />
        {stock <= 5 && stock > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
            Only {stock} left!
          </span>
        )}
        {stock === 0 && (
          <span className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded text-sm">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-600">{brand}</p>
          </div>
          {averageRating > 0 && (
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600 ml-1">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4">{description}</p>

        {colors?.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Colors:</p>
            <div className="flex gap-2">
              {colors.map((c, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(c.color)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === c.color
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: c.hexCode }}
                  title={c.color}
                />
              ))}
            </div>
          </div>
        )}

        {sizes?.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Sizes:</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((s, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSize(s.size)}
                  className={`px-3 py-1 text-sm rounded ${
                    selectedSize === s.size
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  } ${
                    s.stock === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-100"
                  }`}
                  disabled={s.stock === 0}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <p className="text-blue-600 font-bold text-lg">
            {formatCurrency(price)}
          </p>
          <button
            onClick={handleAddToCart}
            className={`px-4 py-2 rounded ${
              stock > 0
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={stock === 0}
          >
            {stock > 0 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
