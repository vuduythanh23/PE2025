import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUser } from "../utils/api";
import Swal from "sweetalert2";
import Header from "../components/layout/Header";
import AdminTable from "../styles/components/AdminTable";
import OrderManagement from "../components/modules/OrderManagement";
import { useLoading } from "../context/LoadingContext";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'orders'
  const { handleAsyncOperation } = useLoading();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await handleAsyncOperation(
          () => getAllUsers(),
          "Failed to fetch users"
        );
        setUsers(data);
      } catch (error) {
        // Error will be handled by handleAsyncOperation
      }
    };

    getUsers();
  }, [handleAsyncOperation]);

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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-luxury-forest/5 to-luxury-light/5">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-luxury-gold mb-4">
              Admin Dashboard
            </h1>
            <div className="w-24 h-0.5 bg-luxury-gold mx-auto"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6">
            {/* Tabs */}
            <div className="flex gap-6 mb-8 border-b border-luxury-gold/20">
              <button
                className={`pb-4 font-serif text-sm tracking-wider transition-colors relative
                  ${
                    activeTab === "users"
                      ? "text-luxury-gold border-b-2 border-luxury-gold -mb-[2px]"
                      : "text-luxury-dark/60 hover:text-luxury-dark"
                  }`}
                onClick={() => setActiveTab("users")}
              >
                User Management
              </button>
              <button
                className={`pb-4 font-serif text-sm tracking-wider transition-colors relative
                  ${
                    activeTab === "orders"
                      ? "text-luxury-gold border-b-2 border-luxury-gold -mb-[2px]"
                      : "text-luxury-dark/60 hover:text-luxury-dark"
                  }`}
                onClick={() => setActiveTab("orders")}
              >
                Order Management
              </button>
            </div>

            <AdminTable
              users={users}
              editingUser={editingUser}
              onEdit={handleEdit}
              onSave={handleSave}
              onChange={handleChange}
              onCancel={handleCancelEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </>
  );
}
