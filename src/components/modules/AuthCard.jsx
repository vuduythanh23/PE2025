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
        return validateEmail(value);
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
          const fieldName = name.replace(/([A-Z])/g, ' $1').toLowerCase();
          return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
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
      setFormData(prev => ({
        ...prev,
        email: prev.email.trim()
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
      // Update confirmPassword validation if password changes
      ...(name === "password" && formData.confirmPassword
        ? { confirmPassword: validatePasswordMatch(value, formData.confirmPassword) }
        : {}),
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {type === "login" ? "Login" : "Register"}
        </h1>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div className="mb-4" key={field}>
              <label
                htmlFor={field}
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                {field === "confirmPassword"
                  ? "Confirm Password"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>              <input
                type={
                  field === "password" || field === "confirmPassword"
                    ? "password"
                    : field === "email"
                    ? "email"
                    : field === "phoneNumber"
                    ? "tel"
                    : "text"
                }
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                autoComplete={
                  field === "password"
                    ? "current-password"
                    : field === "email"
                    ? "email"
                    : field === "phoneNumber"
                    ? "tel"
                    : "off"
                }
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                  loading
                    ? "bg-gray-100 cursor-not-allowed"
                    : errors[field] && touched[field]
                    ? "border-red-500 focus:ring-red-200"
                    : touched[field] && !errors[field]
                    ? "border-green-500 focus:ring-green-200"
                    : "focus:ring-blue-200"
                }`}
                placeholder={`Enter your ${
                  field === "confirmPassword"
                    ? "password again"
                    : field.replace(/([A-Z])/g, " $1").toLowerCase()
                }`}
                required
              />
              {errors[field] && (
                <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={
              loading || (type === "register" && errors.confirmPassword)
            }
          >
            {loading
              ? "Processing..."
              : type === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
