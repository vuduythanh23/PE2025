import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { loginUser, registerUser } from "../utils";
import Swal from "sweetalert2";

// Brand logos array
const brandLogos = [
  {
    id: "nike",
    logo: new URL("../assets/img/nike.svg", import.meta.url).href,
    alt: "Nike Logo",
  },
  {
    id: "adidas", 
    logo: new URL("../assets/img/adidas.svg", import.meta.url).href,
    alt: "Adidas Logo",
  },
  {
    id: "puma",
    logo: new URL("../assets/img/puma.svg", import.meta.url).href,
    alt: "Puma Logo",
  },
  {
    id: "newBalance",
    logo: new URL("../assets/img/new-balance.svg", import.meta.url).href,
    alt: "New Balance Logo",
  },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Register form data
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: ""
  });

  const [errors, setErrors] = useState({});

  // Validation functions
  const validateField = (name, value, formType = activeTab) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!value.includes("@")) return "Email should contain @";
        if (!value.toLowerCase().endsWith("@gmail.com"))
          return "Email should end with @gmail.com";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        const password = formType === "register" ? registerData.password : "";
        if (value !== password) return "Passwords do not match";
        return "";
      case "phoneNumber":
        if (!value) return "Phone number is required";
        if (!/^\d{10,11}$/.test(value.replace(/[^0-9]/g, ""))) 
          return "Phone number should be 10-11 digits";
        return "";
      default:
        if (!value?.trim()) {
          const fieldName = name.replace(/([A-Z])/g, " $1").toLowerCase();
          return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }
        return "";
    }
  };

  const handleInputChange = (formType, field, value) => {
    if (formType === "login") {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (formType) => {
    const data = formType === "login" ? loginData : registerData;
    const newErrors = {};

    Object.keys(data).forEach(field => {
      const error = validateField(field, data[field], formType);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm("login")) return;

    setLoading(true);
    try {
      const response = await loginUser(loginData.email, loginData.password);

      if (!response?.user) {
        throw new Error("Invalid response from server");
      }

      const isAdmin = response.user.role === "admin";
      sessionStorage.setItem("userRole", isAdmin ? "admin" : "user");
      sessionStorage.setItem("user", JSON.stringify(response.user));

      const params = new URLSearchParams(location.search);
      const redirectPath = params.get("redirect") || (isAdmin ? "/admin" : "/products");

      await Swal.fire({
        title: isAdmin ? "Admin Login Successful!" : "Login Successful!",
        text: isAdmin
          ? "Welcome to the Admin Panel."
          : `Welcome, ${response.user.username || "User"}!`,
        icon: "success",
        confirmButtonText: "OK",
        timer: 2000,
        showConfirmButton: false
      });

      navigate(redirectPath);
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Login Failed";
      let icon = "error";

      if (error.message.includes("temporarily locked")) {
        errorTitle = "Account Temporarily Locked";
        icon = "warning";
        errorMessage = error.message;
      } else if (error.message.includes("contact an administrator")) {
        errorTitle = "Account Locked";
        icon = "warning";
        errorMessage = "Your account has been locked due to too many failed attempts. Please contact an administrator to unlock your account.";
      } else if (error.message.includes("remaining")) {
        errorTitle = "Invalid Password";
        icon = "warning";
        errorMessage = error.message;
      } else if (error.message === "Invalid credentials") {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message === "Request timed out") {
        errorMessage = "The connection timed out. Please check your internet connection and try again.";
      } else if (error.message === "Network Error") {
        errorMessage = "Unable to connect to the server. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        title: errorTitle,
        text: errorMessage,
        icon: icon,
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm("register")) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registrationData } = registerData;
      const response = await registerUser(registrationData);
      
      // Auto login after successful registration
      sessionStorage.setItem("userRole", "user");
      sessionStorage.setItem("user", JSON.stringify(response.user));

      await Swal.fire({
        title: "Registration Successful!",
        text: `Welcome, ${response.user.username}! You have been automatically logged in.`,
        icon: "success",
        confirmButtonText: "OK",
        timer: 2000,
        showConfirmButton: false
      });

      // Navigate to products page
      navigate("/products");
    } catch (error) {
      let errorMsg = error.message;
      try {
        const parsed = JSON.parse(errorMsg);
        errorMsg = parsed.message || errorMsg;
      } catch {}
      
      Swal.fire({
        title: "Registration Failed",
        text: errorMsg || "Please check your input and try again.",
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 bg-gradient-to-br from-luxury-forest/5 to-luxury-light/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Side - Auth Form */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-serif text-luxury-dark mb-2">
                    {activeTab === "login" ? "Welcome Back" : "Join SNKRSS"}
                  </h1>
                  <div className="w-16 h-0.5 bg-luxury-gold mx-auto"></div>
                </div>                {/* Tab Navigation */}
                <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
                  <button
                    className={`auth-tab-button flex-1 py-3 px-4 rounded-md font-serif text-sm tracking-wider transition-all ${
                      activeTab === "login"
                        ? "bg-luxury-gold text-white shadow-md"
                        : "text-luxury-dark/70 hover:text-luxury-dark"
                    }`}
                    onClick={() => setActiveTab("login")}
                  >
                    Sign In
                  </button>
                  <button
                    className={`auth-tab-button flex-1 py-3 px-4 rounded-md font-serif text-sm tracking-wider transition-all ${
                      activeTab === "register"
                        ? "bg-luxury-gold text-white shadow-md"
                        : "text-luxury-dark/70 hover:text-luxury-dark"
                    }`}
                    onClick={() => setActiveTab("register")}
                  >
                    Create Account
                  </button>
                </div>

                {/* Login Form */}
                {activeTab === "login" && (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                        Email
                      </label>
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => handleInputChange("login", "email", e.target.value)}
                        className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                        placeholder="Enter your email"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                        Password
                      </label>
                      <input
                        type="password"
                        value={loginData.password}
                        onChange={(e) => handleInputChange("login", "password", e.target.value)}
                        className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                        placeholder="Enter your password"
                      />
                      {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full bg-luxury-gold text-white py-3 rounded-lg font-serif text-sm tracking-wider transition-all transform hover:scale-[1.02] hover:shadow-lg ${
                        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-luxury-dark"
                      }`}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </button>
                  </form>
                )}

                {/* Register Form */}
                {activeTab === "register" && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                          Username
                        </label>
                        <input
                          type="text"
                          value={registerData.username}
                          onChange={(e) => handleInputChange("register", "username", e.target.value)}
                          className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                          placeholder="Enter username"
                        />
                        {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                          Email
                        </label>
                        <input
                          type="email"
                          value={registerData.email}
                          onChange={(e) => handleInputChange("register", "email", e.target.value)}
                          className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                          placeholder="Enter email"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                          Password
                        </label>
                        <input
                          type="password"
                          value={registerData.password}
                          onChange={(e) => handleInputChange("register", "password", e.target.value)}
                          className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                          placeholder="Enter password"
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={registerData.confirmPassword}
                          onChange={(e) => handleInputChange("register", "confirmPassword", e.target.value)}
                          className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                          placeholder="Confirm password"
                        />
                        {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={registerData.firstName}
                          onChange={(e) => handleInputChange("register", "firstName", e.target.value)}
                          className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                          placeholder="Enter first name"
                        />
                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={registerData.lastName}
                          onChange={(e) => handleInputChange("register", "lastName", e.target.value)}
                          className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                          placeholder="Enter last name"
                        />
                        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                          Address
                        </label>
                        <input
                          type="text"
                          value={registerData.address}
                          onChange={(e) => handleInputChange("register", "address", e.target.value)}
                          className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                          placeholder="Enter delivery address"
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={registerData.phoneNumber}
                          onChange={(e) => handleInputChange("register", "phoneNumber", e.target.value)}
                          className="w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                          placeholder="Enter phone number"
                        />
                        {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full bg-luxury-gold text-white py-3 rounded-lg font-serif text-sm tracking-wider transition-all transform hover:scale-[1.02] hover:shadow-lg mt-6 ${
                        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-luxury-dark"
                      }`}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
                  </form>
                )}
              </div>

              {/* Right Side - Brand Showcase */}
              <div className="hidden lg:block">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-serif text-luxury-dark mb-4">
                    Premium Sneaker Brands
                  </h2>
                  <p className="text-luxury-dark/70 font-serif">
                    Discover the world's most coveted sneaker collections
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">                  {brandLogos.map((brand, index) => (
                    <div
                      key={brand.id}
                      className="brand-logo-card p-8 bg-white rounded-xl shadow-lg transform transition-all hover:scale-105 hover:shadow-xl"
                      style={{
                        animationDelay: `${index * 0.2}s`,
                        animation: 'fadeInUp 0.8s ease-out forwards'
                      }}
                    >
                      <img
                        src={brand.logo}
                        alt={brand.alt}
                        className="w-24 h-24 object-contain mx-auto filter hover:drop-shadow-lg transition-all"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-luxury-dark/60 font-serif text-sm">
                    Join thousands of sneaker enthusiasts worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
