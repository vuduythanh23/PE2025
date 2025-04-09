export default function Header() {
    return (
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sneakers Store</h1>
        <nav>
          <ul className="flex gap-6 text-gray-600 text-sm">
            <li><a href="#" className="hover:text-black">Home</a></li>
            <li><a href="#" className="hover:text-black">Products</a></li>
            <li><a href="#" className="hover:text-black">Contact</a></li>
          </ul>
        </nav>
      </header>
    )
  }
  