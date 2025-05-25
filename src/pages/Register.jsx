import { useState } from "react";
import Header from "../components/layout/Header";
import AuthCard from "../components/modules/AuthCard";
import { registerUser } from "../utils"; // Import register API function
import Swal from "sweetalert2";

export default function Register() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = formData;
      const response = await registerUser(registrationData); // Call register API
      Swal.fire({
        title: "Registration Successful!",
        text: `Welcome, ${response.user.username}!`,
        icon: "success",
        confirmButtonText: "OK",
      });
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
          "confirmPassword",
          "firstName",
          "lastName",
          "address",
          "phoneNumber",
        ]} // Include all required fields for registration
      />
    </>
  );
}
