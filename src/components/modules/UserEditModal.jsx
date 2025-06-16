import React, { useState, useEffect } from "react";
import {
  validateEmail,
  validatePhone,
  validateCity,
  validateState,
  validatePostalCode,
} from "../../utils";

const UserEditModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        postalCode: user.postalCode || "",
      });
      setErrors({});
    }
  }, [user, isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate a single field
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "phoneNumber":
        return value ? validatePhone(value) : "";
      case "city":
        return value ? validateCity(value) : "";
      case "state":
        return value ? validateState(value) : "";
      case "postalCode":
        return value ? validatePostalCode(value) : "";
      case "username":
        if (!value || value.trim() === "") {
          return "Username is required.";
        }
        if (value.trim().length < 3) {
          return "Username must be at least 3 characters long.";
        }
        return "";
      case "firstName":
        if (!value || value.trim() === "") {
          return "First name is required.";
        }
        return "";
      case "lastName":
        if (!value || value.trim() === "") {
          return "Last name is required.";
        }
        return "";
      default:
        return "";
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    const requiredFields = ["username", "email", "firstName", "lastName"];
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate optional fields if they have values
    const optionalFields = ["phoneNumber", "city", "state", "postalCode"];
    optionalFields.forEach((field) => {
      if (formData[field]) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Clean up form data - remove empty values
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(
          ([key, value]) => value !== undefined && value !== null && value.trim() !== ""
        )
      );

      await onSave(user._id, cleanData);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-serif text-gray-800">Edit User</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors
                    ${errors.username ? "border-red-500" : "border-gray-300"}
                    ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors
                    ${errors.email ? "border-red-500" : "border-gray-300"}
                    ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors
                    ${errors.firstName ? "border-red-500" : "border-gray-300"}
                    ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors
                    ${errors.lastName ? "border-red-500" : "border-gray-300"}
                    ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors
                    ${errors.phoneNumber ? "border-red-500" : "border-gray-300"}
                    ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Address Information
            </h3>

            <div className="space-y-4">
              {/* Street Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={2}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors resize-none
                    ${errors.address ? "border-red-500" : "border-gray-300"}
                    ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  placeholder="Enter street address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              {/* City, State, Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors
                      ${errors.city ? "border-red-500" : "border-gray-300"}
                      ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors
                      ${errors.state ? "border-red-500" : "border-gray-300"}
                      ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="Enter state/province"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors
                      ${errors.postalCode ? "border-red-500" : "border-gray-300"}
                      ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
                    placeholder="Enter postal code"
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Status Info */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Account Status
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Account ID:</span>
                  <span className="ml-2 text-gray-600 font-mono">{user._id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium
                    ${user.isPermanentlyLocked || user.lockUntil
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                    }`}>
                    {user.isPermanentlyLocked
                      ? "Permanently Locked"
                      : user.lockUntil && new Date(user.lockUntil) > new Date()
                      ? "Temporarily Locked"
                      : "Active"}
                  </span>
                </div>
                {user.createdAt && (
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {user.isAdmin && (
                  <div>
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      Administrator
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
