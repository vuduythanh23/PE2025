import { useEffect, useState } from "react";
import { 
  getAllUsers, 
  adminUpdateUser, 
  deleteUser, 
  unlockUserAccount 
} from '../utils/api/users.js';
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
    const fetchUsers = async () => {
      try {
        const data = await handleAsyncOperation(
          () => getAllUsers(),
          "Failed to fetch users"
        );
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load users. Please check your permissions and try again.",
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    };

    fetchUsers();
  }, [handleAsyncOperation]);

  const handleEdit = (user) => {
    setEditingUser({
      ...user,
      username: user.username || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    });
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
      if (!editingUser || !editingUser._id) {
        throw new Error("No user selected for editing");
      }

      const { _id, ...updates } = editingUser;
      
      // Remove any undefined or empty values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key, value]) => value !== undefined && value !== "")
      );

      const updatedUser = await handleAsyncOperation(
        () => adminUpdateUser(_id, cleanUpdates),
        "Failed to update user"
      );

      setUsers(users.map(user => 
        user._id === _id ? { ...user, ...cleanUpdates } : user
      ));
      setEditingUser(null);
      
      Swal.fire({
        title: "Success",
        text: "User updated successfully",
        icon: "success",
        confirmButtonText: "OK"
      });
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to update user",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleDelete = async (userId) => {
    if (!userId) {
      Swal.fire("Error!", "Invalid user ID.", "error");
      return;
    }

    // Confirm deletion with SweetAlert
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await handleAsyncOperation(
          () => deleteUser(userId),
          "Failed to delete user"
        );
        
        setUsers(users.filter(user => user._id !== userId));
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error!", error.message || "Failed to delete user.", "error");
      }
    }
  };

  const handleUnlock = async (userId) => {
    if (!userId) {
      Swal.fire("Error!", "Invalid user ID.", "error");
      return;
    }

    try {
      await handleAsyncOperation(
        () => unlockUserAccount(userId),
        "Failed to unlock user account"
      );
      
      // Update the user status in the list
      setUsers(users.map(user => 
        user._id === userId ? { 
          ...user, 
          isPermanentlyLocked: false,
          lockUntil: null,
          failedLoginAttempts: 0
        } : user
      ));
      
      Swal.fire("Success!", "User account unlocked.", "success");
    } catch (error) {
      console.error("Error unlocking user:", error);
      Swal.fire("Error!", error.message || "Failed to unlock user account.", "error");
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

            {activeTab === "users" ? (
              <AdminTable
                users={users}
                editingUser={editingUser}
                onEdit={handleEdit}
                onSave={handleSave}
                onChange={handleChange}
                onCancel={handleCancelEdit}
                onDelete={handleDelete}
                onUnlock={handleUnlock}
              />
            ) : (
              <OrderManagement />
            )}
          </div>
        </div>
      </main>
    </>
  );
}