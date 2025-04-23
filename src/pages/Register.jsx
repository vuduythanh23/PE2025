import { useState } from "react";
import Header from "../components/layout/header";
import AuthCard from "../components/modules/AuthCard";
import { registerUser } from "../utils/api"; // Import register API function
import Swal from "sweetalert2";

export default function Register() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      const response = await registerUser(formData); // Call register API
      Swal.fire({
        title: "Registration Successful!",
        text: `Welcome, ${response.user.username}!`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Registration Failed",
        text: error.message || "Please check your input and try again.",
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
        type="register"
        onSubmit={handleRegister} // Pass the register handler
        loading={loading} // Pass the loading state
        fields={[
          "username",
          "email",
          "password",
          "firstName",
          "lastName",
          "address",
          "phoneNumber",
        ]} // Include all required fields for registration
      />
    </>
  );
}