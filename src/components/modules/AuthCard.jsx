import { useState, useEffect } from "react";

export default function AuthCard({ type, onSubmit, loading, fields = [] }) {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field]: "" }), {})
  );
  const [errors, setErrors] = useState({});

  // Add real-time password validation
  useEffect(() => {
    if (type === "register" && formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  }, [formData.password, formData.confirmPassword, type]);

  const validate = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required.`;
      }
    });

    // Add password matching validation for registration
    if (type === "register" && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing, except for confirm password
    if (errors[name] && name !== "confirmPassword") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
              </label>
              <input
                type={field === "password" || field === "confirmPassword" ? "password" : "text"}
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-200 ${
                  errors[field] ? "border-red-500" : ""
                }`}
                placeholder={`Enter your ${
                  field === "confirmPassword" ? "password again" : field
                }`}
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
