export default function ProductCard({ name, image, price }) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition">
        <img src={image} alt={name} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-blue-600 font-bold mt-2">${price}</p>
          <button className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Buy Now
          </button>
        </div>
      </div>
    )
  }
  