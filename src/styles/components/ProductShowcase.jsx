import ProductCard from "../../components/modules/ProductCard";

export default function ProductShowcase({ products }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
        {products.map((product, i) => (
          <div key={i} className="group">
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </section>
  );
}
