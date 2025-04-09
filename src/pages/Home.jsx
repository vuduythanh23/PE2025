import ProductCard from '../components/modules/ProductCard'

const products = [
  {
    name: 'Air Jordan 1',
    image: 'https://picsum.photos/200/300',
    price: 199
  },
  {
    name: 'Nike Air Max 90',
    image: 'https://picsum.photos/200/300',
    price: 149
  },
  {
    name: 'Adidas Yeezy Boost',
    image: 'https://picsum.photos/200/300',
    price: 299
  }
]

export default function Home() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Featured Sneakers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>
    </section>
  )
}
