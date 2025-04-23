import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/modules/AuthCard"; // Import AuthCard
import { loginUser } from "../utils/api"; // Login API function
import Swal from "sweetalert2";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (formData) => {
    const { email, password } = formData;
    setLoading(true);
    try {
      const response = await loginUser(email, password);

      // Check if the logged-in user is an admin
      if (email === "admin@gmail.com") {
        Swal.fire({
          title: "Admin Login Successful!",
          text: "Welcome to the Admin Panel.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/admin"); // Navigate to the admin page
        });
      } else {
        Swal.fire({
          title: "Login Successful!",
          text: `Welcome, ${response.user.username || "User"}!`,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/"); // Navigate to the home page for normal users
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text: error.message || "Invalid email or password.",
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      type="login"
      onSubmit={handleLogin}
      loading={loading}
      fields={["email", "password"]}
    />
  );
}