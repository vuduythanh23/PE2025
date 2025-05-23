import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUser } from "../utils/api";
import Swal from "sweetalert2";
import Header from "../components/layout/Header";
import AdminTable from "../styles/components/AdminTable";
import OrderManagement from "../components/modules/OrderManagement";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'orders'

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error.message || "Failed to fetch users.",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setLoading(false);
      }
    };

    getUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleChange = (e) => {
    setEditingUser((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateUser(editingUser);
      setUsers(
        users.map((user) => (user._id === editingUser._id ? editingUser : user))
      );
      setEditingUser(null);
      Swal.fire({
        title: "Success",
        text: "User updated successfully",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to update user",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleDelete = async (userId) => {
    const userToDelete = users.find((u) => u._id === userId);
    if (userToDelete.isAdmin) {
      Swal.fire({
        title: "Error",
        text: "Admin users cannot be deleted",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user._id !== userId));
      Swal.fire({
        title: "Success",
        text: "User deleted successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to delete user.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Panel</h1>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "orders"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Order Management
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "users" ? (
          <AdminTable
            users={users}
            editingUser={editingUser}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            onChange={handleChange}
            onDelete={handleDelete}
          />
        ) : (
          <OrderManagement />
        )}
      </div>
    </>
  );
}
