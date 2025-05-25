import { useState, useEffect } from "react";
import {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validatePhone,
} from "../../utils/validation-utils";

export default function AuthCard({ type, onSubmit, loading, fields = [] }) {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field]: "" }), {})
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Enhanced field validation with error messages
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "Email is required";
        if (!value.includes("@")) return "Email should contain @";
        if (!value.toLowerCase().endsWith("@gmail.com"))
          return "Email should end with @gmail.com";
        return "";
      case "password":
        if (!value) return "Password is required";
        return validatePassword(value);
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        return validatePasswordMatch(formData.password, value);
      case "phoneNumber":
        if (!value) return "Phone number is required";
        return validatePhone(value);
      default:
        if (!value.trim()) {
          const fieldName = name.replace(/([A-Z])/g, " $1").toLowerCase();
          return `${
            fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
          } is required`;
        }
        return validateRequired(value, name);
    }
  };

  // Add real-time password validation
  useEffect(() => {
    if (type === "register" && formData.password && formData.confirmPassword) {
      const error = validatePasswordMatch(
        formData.password,
        formData.confirmPassword
      );
      if (error) {
        setErrors((prev) => ({ ...prev, confirmPassword: error }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  }, [formData.password, formData.confirmPassword, type]);

  const validate = () => {
    const newErrors = {};
    fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    setErrors({});

    // Trim whitespace from email
    if (formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email.trim(),
      }));
    }

    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on change for better user experience
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
      ...(name === "password" && formData.confirmPassword
        ? {
            confirmPassword: validatePasswordMatch(
              value,
              formData.confirmPassword
            ),
          }
        : {}),
    }));
  };

  return (    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-luxury-dark">
            {type === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <div className="w-16 h-0.5 bg-luxury-gold mx-auto mt-4"></div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif"
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                id={field}
                name={field}
                type={field.includes("password") ? "password" : "text"}
                value={formData[field]}
                onChange={handleChange}
                className="w-full p-3 border-b border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif"
                placeholder={`Enter your ${field.toLowerCase()}`}
              />
              {touched[field] && errors[field] && (
                <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className={`w-full bg-luxury-gold text-white py-3 font-serif text-sm tracking-wider transition-colors
              ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-luxury-dark"}`}
            disabled={loading || (type === "register" && errors.confirmPassword)}
          >
            {loading
              ? "Processing..."
              : type === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
