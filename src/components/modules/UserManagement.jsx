import { useEffect, useState } from "react";
import { 
  getAllUsers, 
  adminUpdateUser, 
  deleteUser, 
  unlockUserAccount 
} from '../../utils/api/users.js';
import { isAdmin } from '../../utils/storage/auth.js';
import Swal from "sweetalert2";
import UserTable from "./UserTable";
import { useLoading } from "../../context/LoadingContext";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const { handleAsyncOperation } = useLoading();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    // Check if user has admin access
    setHasAdminAccess(isAdmin());
    fetchUsers();
  }, []);

  // Display an error if user doesn't have admin access
  useEffect(() => {
    if (!hasAdminAccess) {
      Swal.fire({
        title: "Access Denied",
        text: "You don't have administrator privileges to manage users.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  }, [hasAdminAccess]);

  const fetchUsers = async () => {
    try {
      // Verify admin access before fetching users
      if (!isAdmin()) {
        throw new Error("Unauthorized: Administrator access required");
      }

      const data = await handleAsyncOperation(
        () => getAllUsers(),
        "Fetching users"
      );
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to load users. Please check your permissions and try again.",
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };

  const handleEdit = (user) => {
    setEditingUser({
      ...user,
      username: user.username || "",
      email: user.email || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      address: user.address || "",
      phoneNumber: user.phoneNumber || "",
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
      // Verify admin access before updating user
      if (!isAdmin()) {
        throw new Error("Unauthorized: Administrator access required");
      }

      if (!editingUser || !editingUser._id) {
        throw new Error("No user selected for editing");
      }

      // Extract fields that should not be sent to the API
      const { 
        _id, 
        createdAt, 
        updatedAt, 
        failedLoginAttempts,
        lockUntil,
        isPermanentlyLocked,
        lastFailedAttemptAt,
        __v,
        ...updates 
      } = editingUser;
      
      // Remove any undefined, null or empty values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key, value]) => 
          value !== undefined && 
          value !== null && 
          (typeof value !== 'string' || value.trim() !== "")
        )
      );

      // Validate email if it's being updated
      if (cleanUpdates.email && !cleanUpdates.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate phone number if it's being updated
      if (cleanUpdates.phoneNumber && !cleanUpdates.phoneNumber.match(/^\d{10,15}$/)) {
        throw new Error("Please enter a valid phone number (10-15 digits)");
      }

      console.log("Updating user with ID:", _id, "Updates:", cleanUpdates);

      const updatedUser = await handleAsyncOperation(
        () => adminUpdateUser(_id, cleanUpdates),
        "Updating user"
      );

      console.log("User update response:", updatedUser);

      // If the API call succeeded, update the UI state
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
      
      // Provide more detailed error messages for common issues
      let errorMessage = error.message || "Failed to update user";
      
      if (error.message?.includes("Unauthorized")) {
        errorMessage = "You don't have permission to update this user. Please check your admin privileges.";
      } else if (error.message?.includes("Network Error")) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };
  const handleDelete = async (userId) => {
    // Verify admin access before deleting user
    if (!isAdmin()) {
      Swal.fire({
        title: "Access Denied",
        text: "You don't have administrator privileges to delete users.",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    if (!userId) {
      Swal.fire({
        title: "Error!",
        text: "Invalid user ID.",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }
    
    // Check if user is admin
    const targetUser = users.find(user => user._id === userId);
    if (targetUser && targetUser.isAdmin) {
      Swal.fire({
        title: "Cannot Delete Admin",
        text: "Administrator accounts cannot be deleted.",
        icon: "warning",
        confirmButtonText: "OK"
      });
      return;
    }

    // Confirm deletion with SweetAlert
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete this user account. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel"
    });

    if (result.isConfirmed) {
      try {
        // Show loading state
        Swal.fire({
          title: "Deleting...",
          text: "Please wait while we process your request.",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          }
        });
        
        console.log("Deleting user with ID:", userId);
        await handleAsyncOperation(
          () => deleteUser(userId),
          "Deleting user"
        );
        
        // Update local state
        setUsers(users.filter(user => user._id !== userId));
        
        Swal.fire({
          title: "Deleted!",
          text: "User has been successfully deleted.",
          icon: "success",
          confirmButtonText: "OK"
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        
        let errorMessage = error.message || "Failed to delete user.";
        if (error.message?.includes("Unauthorized")) {
          errorMessage = "You don't have permission to delete this user. Please check your admin privileges.";
        }
        
        Swal.fire({
          title: "Error!",
          html: `<p>${errorMessage}</p>
                <p class="text-sm mt-2">If this problem persists, please contact the system administrator.</p>`,
          icon: "error",
          confirmButtonText: "OK"
        });
      }
    }
  };
  const handleUnlock = async (userId) => {
    // Verify admin access before unlocking user
    if (!isAdmin()) {
      Swal.fire({
        title: "Access Denied",
        text: "You don't have administrator privileges to unlock user accounts.",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    if (!userId) {
      Swal.fire({
        title: "Error!",
        text: "Invalid user ID.",
        icon: "error",
        confirmButtonText: "OK"
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: "Confirm Unlock",
        text: "Are you sure you want to unlock this user account?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, unlock it!",
        cancelButtonText: "No, cancel",
      });
      
      if (!result.isConfirmed) {
        return;
      }
      
      console.log("Unlocking user with ID:", userId);
      await handleAsyncOperation(
        () => unlockUserAccount(userId),
        "Unlocking user account"
      );
      
      // Update the user status in the list
      setUsers(users.map(user => 
        user._id === userId ? { 
          ...user, 
          isPermanentlyLocked: false,
          lockUntil: null,
          failedLoginAttempts: 0,
          lastFailedAttemptAt: null
        } : user
      ));
      
      Swal.fire({
        title: "Success!",
        text: "User account has been unlocked successfully.",
        icon: "success",
        confirmButtonText: "OK"
      });
    } catch (error) {
      console.error("Error unlocking user:", error);
      
      let errorMessage = error.message || "Failed to unlock user account.";
      if (error.message?.includes("Unauthorized")) {
        errorMessage = "You don't have permission to unlock this user. Please check your admin privileges.";
      }
      
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium text-gray-700">User Accounts</h2>
        <button 
          onClick={fetchUsers}
          className="px-4 py-2 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      <UserTable
        users={users}
        editingUser={editingUser}
        onEdit={handleEdit}
        onSave={handleSave}
        onChange={handleChange}
        onCancel={handleCancelEdit}
        onDelete={handleDelete}
        onUnlock={handleUnlock}
      />
    </div>
  );
}