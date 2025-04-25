import { Link } from "react-router-dom"

export default function Header() {
    const token = localStorage.getItem("token");
    
    return (
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">SnkrSS</h1>
        <nav>
          <ul className="flex gap-6 text-gray-600 text-sm">
            <li><Link to="/home" className="hover:text-blue-600">Home</Link></li>
            <li><a href="#" className="hover:text-blue-600">Products</a></li>
            {token ? (
              <>
                <li><Link to="/profile" className="hover:text-blue-600">Profile</Link></li>
                <li><a href="#" onClick={(e) => {
                  e.preventDefault();
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }} className="hover:text-blue-600">Logout</a></li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="hover:text-blue-600">Login</Link></li>
                <li><Link to="/register" className="hover:text-blue-600">Register</Link></li>
              </>
            )}
            <li><a href="#" className="hover:text-blue-600">Contact</a></li>
          </ul>
        </nav>
      </header>
    )
  }
