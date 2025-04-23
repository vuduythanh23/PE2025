import { Link } from "react-router-dom"
export default function Header() {
    return (
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sneakers Store</h1>
        <nav>
          <ul className="flex gap-6 text-gray-600 text-sm">
          <li><Link to="/home" href="#" className="hover:text-blue-600">Home</Link></li>
            <li><a href="#" className="hover:text-blue-600">Products</a></li>
            <li><Link to="/login" href="#" className="hover:text-blue-600">Login</Link></li>
            <li><Link to="/register" href="#" className="hover:text-blue-600">Register</Link></li>
            <li><a href="#" className="hover:text-blue-600">Contact</a></li>
          </ul>
        </nav>
      </header>
    )
  }
  