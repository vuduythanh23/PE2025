import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/modules/AuthCard";
import { loginUser } from "../utils";
import Swal from "sweetalert2";
import Header from "../components/layout/Header";

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
        confirmButtonText: "Retry"
      });
      return;
    }

    const { email, password } = formData;
    setLoading(true);

    try {
      const response = await loginUser(email, password);
      
      if (!response?.user) {
        throw new Error('Invalid response from server');
      }
      
      // Check if the logged-in user is an admin based on the response
      const isAdmin = response.user.role === 'admin';
      
      sessionStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
      sessionStorage.setItem('user', JSON.stringify(response.user));
        // Check if there's a redirect parameter in the URL
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get('redirect') || (isAdmin ? "/admin" : "/");
      
      await Swal.fire({
        title: isAdmin ? "Admin Login Successful!" : "Login Successful!",
        text: isAdmin ? "Welcome to the Admin Panel." : `Welcome, ${response.user.username || "User"}!`,
        icon: "success",
        confirmButtonText: "OK",
      });
      
      // Navigate after the alert is closed
      navigate(redirectPath);} catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.message === "Invalid credentials") {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.message === "Request timed out") {
        errorMessage = "The connection timed out. Please check your internet connection and try again.";
      } else if (error.message === "Network Error") {
        errorMessage = "Unable to connect to the server. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        title: "Login Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <AuthCard
        type="login"
        onSubmit={handleLogin}
        loading={loading}
        fields={["email", "password"]}
      />
    </>
  );
}
