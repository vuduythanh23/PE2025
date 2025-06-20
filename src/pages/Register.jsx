import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AuthCard from "../components/modules/AuthCard";
import { registerUser, loginUser } from "../utils";
import Swal from "sweetalert2";

// Brand logos array using URL constructor
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

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      const { confirmPassword, ...registrationData } = formData;
      const response = await registerUser(registrationData);

      // Hiển thị thông báo đăng ký thành công
      await Swal.fire({
        title: "Registration Successful!",
        text: `Welcome, ${response.user.username}! You will be automatically logged in.`,
        icon: "success",
        confirmButtonText: "OK",
      });

      // Tự động đăng nhập sau khi đăng ký thành công
      try {
        const loginResponse = await loginUser(
          registrationData.email,
          registrationData.password
        );
        if (loginResponse?.user) {
          // Lưu thông tin user vào sessionStorage
          const isAdmin = loginResponse.user.role === "admin";
          sessionStorage.setItem("userRole", isAdmin ? "admin" : "user");
          sessionStorage.setItem("user", JSON.stringify(loginResponse.user));

          // Chuyển hướng tới trang phù hợp
          const redirectPath = isAdmin ? "/admin" : "/products";
          navigate(redirectPath);
        }
      } catch (loginError) {
        console.error("Auto-login failed:", loginError);
        // Nếu auto-login thất bại, chuyển về trang login
        navigate("/login");
      }
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
  const formFields = [
    { id: "username", label: "Username" },
    { id: "email", label: "Email Address" },
    { id: "password", label: "Password" },
    { id: "confirmPassword", label: "Password Confirmation" },
    { id: "firstName", label: "First Name" },
    { id: "lastName", label: "Last Name" },
    { id: "address", label: "Delivery Address" },
    { id: "phoneNumber", label: "Phone Number" },
  ];

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-160px)] flex flex-col md:flex-row">
        {" "}
        {/* Registration form - appears on top on mobile, left side on desktop */}
        <div className="w-full md:w-1/2 p-8">
          <AuthCard
            type="register"
            onSubmit={handleRegister}
            loading={loading}
            fields={formFields}
          />

          {/* Back to Login link */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-block text-luxury-gold hover:text-luxury-dark font-serif text-sm tracking-wider transition-colors underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
        {/* Brand logos - appears below on mobile, right side on desktop */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-8 max-w-md">
            {brandLogos.map((brand) => (
              <div
                key={brand.id}
                className="p-6 bg-white rounded-xl shadow-lg transform transition-all hover:scale-105"
              >
                <img
                  src={brand.logo}
                  alt={brand.alt}
                  className="w-32 h-32 object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
