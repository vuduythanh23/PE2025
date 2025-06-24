import ProductCard from "../../components/modules/ProductCard";

export default function ProductShowcase({ products }) {
  
  if (!Array.isArray(products) || products.length === 0) {
    console.warn("No products to display in showcase");
    return (
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-luxury-gold/50">No products available</p>
        </div>
      </section>
    );
  }
  
  // Filter out any null or invalid products
  const validProducts = products.filter(p => p && p._id);
  
  if (validProducts.length === 0) {
    console.warn("No valid products to display after filtering");
    return (
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-luxury-gold/50">No valid products available</p>
        </div>
      </section>
    );
  }
  
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
        {validProducts.map((product, i) => {
          // console.log(`Rendering product ${i}:`, product);
          return (
            <div key={product._id || i} className="group">
              <ProductCard {...product} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
