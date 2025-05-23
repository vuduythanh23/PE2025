import React, { useEffect, useState } from "react";
import { getCurrentUser, updateUser } from "../utils/api";
import {
  validateEmail,
  validatePhone,
  validatePassword,
} from "../utils/validation-utils";
import Header from "../components/layout/Header";
import ProfileForm from "../styles/components/ProfileForm";
import Swal from "sweetalert2";

const UserProfile = () => {
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
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await getCurrentUser();
        setUser({ ...data, password: "" });
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: "Failed to load user information",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

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

    setLoading(true);
    try {
      const updateData = { ...user };
      if (!updateData.password) {
        delete updateData.password;
      }
      await updateUser(updateData);
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-8">
        <ProfileForm
          user={user}
          editing={editing}
          errors={errors}
          loading={loading}
          onEdit={handleEdit}
          onChange={handleChange}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
};

export default UserProfile;
