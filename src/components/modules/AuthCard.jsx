import { useState, useEffect } from "react";
import {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validatePhone,
} from "../../utils";

export default function AuthCard({ type, onSubmit, loading, fields = [] }) {
  const [formData, setFormData] = useState(
    Array.isArray(fields)
      ? fields.reduce((acc, field) => {
          const fieldId = typeof field === "object" ? field.id : field;
          return { ...acc, [fieldId]: "" };
        }, {})
      : {}
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
        return "";      case "password":
        // For login, only check if password is provided - no other validation
        if (type === "login") {
          return !value ? "Password is required" : "";
        }
        // For registration, validate password requirements
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
  }, [formData.password, formData.confirmPassword, type]);  const validate = () => {
    const newErrors = {};
    const fieldIds = Array.isArray(fields)
      ? fields.map((f) => (typeof f === "object" ? f.id : f))
      : fields;    fieldIds.forEach((field) => {
      const fieldId = typeof field === "object" ? field.id : field;
      // For login passwords, only check if it's provided - no format validation
      if (fieldId === "password" && type === "login") {
        if (!formData[fieldId]) {
          newErrors[fieldId] = "Password is required";
        }
      } else {
        const error = validateField(fieldId, formData[fieldId]);
        if (error) {
          newErrors[fieldId] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Trim whitespace from email first
    const trimmedEmail = formData.email ? formData.email.trim() : "";
    
    // Update formData with trimmed email
    const updatedFormData = {
      ...formData,
      email: trimmedEmail
    };
    
    setFormData(updatedFormData);

    // Validate email specifically for login
    const emailErrors = {};
    
    if (!trimmedEmail) {
      emailErrors.email = "Email is required";
    } else if (!trimmedEmail.includes("@")) {
      emailErrors.email = "Email should contain @";
    } else if (!trimmedEmail.toLowerCase().endsWith("@gmail.com")) {
      emailErrors.email = "Email should end with @gmail.com";
    }

    // Validate password
    if (!formData.password) {
      emailErrors.password = "Password is required";
    }

    // Show errors if any
    if (Object.keys(emailErrors).length > 0) {
      setErrors(emailErrors);
      return;
    }

    // Final validation check
    if (validate()) {
      onSubmit(updatedFormData);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    // For login forms, don't show real-time validation for password field
    if (type === "login" && name === "password") {
      // Clear any existing password errors
      setErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // Validate on change for better user experience (except login password)
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
      ...(name === "password" && formData.confirmPassword && type !== "login"
        ? {
            confirmPassword: validatePasswordMatch(
              value,
              formData.confirmPassword
            ),
          }
        : {}),
    }));
  };

  return (
    <div className="w-full">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 transform hover:scale-[1.01] transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-luxury-dark">
            {type === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <div className="w-16 h-0.5 bg-luxury-gold mx-auto mt-4"></div>
        </div>

        <form
          className={
            type === "login" ? "flex flex-col gap-4" : "grid grid-cols-2 gap-6"
          }
          onSubmit={handleSubmit}
        >
          {/* Xử lý các trường input - hiển thị dọc */}
          {(Array.isArray(fields) &&
          fields.some((field) => typeof field === "object")
            ? fields
            : fields.map((f) => ({
                id: typeof f === "string" ? f : f.id,
                label: typeof f === "string" ? f : f.label,
              }))
          ).map((field) => {
            const fieldId = field.id;
            const fieldLabel = field.label || fieldId;
            return (
              <div
                key={fieldId}
                className={type === "login" ? "w-full mb-4" : "col-span-1"}
              >
                <label
                  htmlFor={fieldId}
                  className="block text-sm font-medium text-luxury-dark/70 mb-2 font-serif"
                >
                  {fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)}
                </label>                <input
                  id={fieldId}
                  name={fieldId}
                  type={
                    fieldId === "password" || fieldId === "confirmPassword"
                      ? "password"
                      : "text"
                  }
                  value={formData[fieldId] || ""}
                  onChange={handleChange}                  className={`w-full p-3 rounded-lg border border-luxury-gold/30 bg-transparent text-luxury-dark/80 focus:outline-none focus:border-luxury-gold font-serif shadow-sm ${
                    fieldId === "password" || fieldId === "confirmPassword" 
                      ? "password-input-no-suggestions" 
                      : ""
                  }`}
                  placeholder={`Enter your ${fieldLabel.toLowerCase()}`}
                  autoComplete={
                    fieldId === "password" 
                      ? "current-password"
                      : fieldId === "confirmPassword"
                      ? "new-password"
                      : fieldId === "email"
                      ? "email"
                      : "off"
                  }
                  spellCheck="false"
                  autoCorrect="off"
                  autoCapitalize="none"
                  data-gramm="false"
                  data-gramm_editor="false"
                  data-enable-grammarly="false"
                  data-lpignore="true"
                  data-form-type="other"
                  data-ms-editor="false"
                  translate="no"                  style={{
                    textDecoration: 'none !important',
                    textDecorationLine: 'none !important',
                    outline: 'none !important',
                    boxShadow: 'none !important',
                    backgroundImage: 'none !important',
                    textUnderlineOffset: '0 !important',
                    textDecorationThickness: '0 !important'
                  }}
                />
                {touched[fieldId] && errors[fieldId] && (
                  <p className="mt-1 text-sm text-red-500">{errors[fieldId]}</p>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            className={`${
              type === "login" ? "w-full" : "col-span-2"
            } bg-luxury-gold text-white py-3 rounded-lg font-serif text-sm tracking-wider transition-all transform hover:scale-[1.02] hover:shadow-lg ${
              type === "login" ? "mt-2" : ""
            }
              ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-luxury-dark"
              }`}
            disabled={
              loading || (type === "register" && errors.confirmPassword)
            }
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
