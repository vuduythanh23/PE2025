import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../components/modules/AuthCard";
import { loginUser } from "../utils";
import Swal from "sweetalert2";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (formData) => {
    // Validate login data
    if (!formData.email || !formData.password) {
      Swal.fire({
        title: "Login Failed",
        text: "Email and password are required",
        icon: "error",
        confirmButtonText: "Retry",
      });
      return;
    }

    const { email, password } = formData;
    setLoading(true);

    try {
      const response = await loginUser(email, password);

      if (!response?.user) {
        throw new Error("Invalid response from server");
      }      // Check if the logged-in user is an admin based on the response
      const isAdmin = response.user.role === "admin" || response.user.isAdmin === true;

      // Store user role consistently
      sessionStorage.setItem("userRole", isAdmin ? "admin" : "user");
      sessionStorage.setItem("user", JSON.stringify(response.user));
      if (isAdmin) {
        sessionStorage.setItem("isAdmin", "true");
      }

      console.log("Login redirect logic:", {
        userRole: response.user.role,
        isAdmin: isAdmin,
        redirectPath: isAdmin ? "/admin" : "/products"
      });

      // Check if there's a redirect parameter in the URL
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get("redirect") || (isAdmin ? "/admin" : "/products");

      await Swal.fire({
        title: isAdmin ? "Admin Login Successful!" : "Login Successful!",
        text: isAdmin
          ? "Welcome to the Admin Panel."
          : `Welcome, ${response.user.username || "User"}!`,
        icon: "success",
        confirmButtonText: "OK",
      });

      // Navigate after the alert is closed
      navigate(redirectPath);
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      let errorTitle = "Login Failed";
      let icon = "error";

      // Handle specific error messages
      if (error.message.includes("temporarily locked")) {
        errorTitle = "Account Temporarily Locked";
        icon = "warning";
        errorMessage = error.message;
      } else if (error.message.includes("contact an administrator")) {
        errorTitle = "Account Locked";
        icon = "warning";
        errorMessage =
          "Your account has been locked due to too many failed attempts. Please contact an administrator to unlock your account.";
      } else if (error.message.includes("remaining")) {
        errorTitle = "Invalid Password";
        icon = "warning";
        errorMessage = error.message;
      } else if (error.message === "Invalid credentials") {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message === "Request timed out") {
        errorMessage =
          "The connection timed out. Please check your internet connection and try again.";
      } else if (error.message === "Network Error") {
        errorMessage =
          "Unable to connect to the server. Please check your internet connection.";
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
  return (
    <div className="flex flex-col min-h-screen">
      <Header />      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <AuthCard
            type="login"
            onSubmit={handleLogin}
            loading={loading}
            fields={["email", "password"]}
          />
          
          {/* Register new account button */}
          <div className="text-center mt-6">
            <Link
              to="/register"
              className="inline-block bg-luxury-forest text-luxury-gold py-3 px-6 rounded-lg font-serif text-sm tracking-wider transition-all transform hover:scale-[1.02] hover:shadow-lg hover:bg-luxury-dark border border-luxury-gold"
            >
              Register new account
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
