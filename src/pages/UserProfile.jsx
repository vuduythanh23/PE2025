import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCurrentUser,
  updateUser,
  validateEmail,
  validatePhone,
  validatePassword,
} from "../utils";
import Header from "../components/layout/Header";
import ProfileForm from "../styles/components/ProfileForm";
import UserOrders from "../components/modules/UserOrders";
import { useLoading } from "../context/LoadingContext";
import Swal from "sweetalert2";

const UserProfile = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [user, setUser] = useState({
    _id: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
    password: "",
  });
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const { handleAsyncOperation } = useLoading();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await handleAsyncOperation(
          () => getCurrentUser(),
          "Failed to load user information"
        );
        setUser({ ...data, password: "" });
      } catch (error) {
        // Error will be handled by handleAsyncOperation
      }
    };

    fetchUser();
  }, [handleAsyncOperation]);

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "phoneNumber":
        return validatePhone(value);
      case "password":
        return value ? validatePassword(value) : ""; // Only validate if password is being changed
      default:
        return "";
    }
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(user).forEach((field) => {
      if (field !== "password" || user[field]) {
        // Only validate password if it's being changed
        const error = validateField(field, user[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    getCurrentUser().then((data) => {
      setUser({ ...data, password: "" });
    });
    setErrors({});
  };
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      const updateData = { ...user };
      if (!updateData.password) {
        delete updateData.password;
      }
      await handleAsyncOperation(
        () => updateUser(user._id, updateData),
        "Failed to update profile"
      );
      setEditing(false);
      Swal.fire({
        title: "Success",
        text: "Profile updated successfully",
        icon: "success",
        confirmButtonText: "OK",
      });
      setUser((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.message || "Failed to update profile",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-8 border-b border-gray-200">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-luxury-gold text-luxury-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-luxury-gold text-luxury-gold'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                My Orders
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <ProfileForm
              user={user}
              editing={editing}
              errors={errors}
              onEdit={handleEdit}
              onChange={handleChange}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}

          {activeTab === 'orders' && <UserOrders />}
        </div>
      </div>
    </>
  );
};

export default UserProfile;
