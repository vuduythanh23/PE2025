import { useEffect, useState } from "react";
import {
  getAllUsers,
  adminUpdateUser,
  deleteUser,
  unlockUserAccount,
  getCurrentUser,
} from "../../utils/api/users.js";
import { isAdmin } from "../../utils/storage/auth.js";
// Import from adminAuth.js with explicit path
import { checkAndRefreshAdminStatus } from "../../utils/helpers/adminAuth.js";
import Swal from "sweetalert2";
import UserTable from "./UserTable";
import UserEditModal from "./UserEditModal";
import UserStatsOverview from "./UserStatsOverview";
import ClientOnlyWrapper from "./ClientOnlyWrapper";
import { useLoading } from "../../context/LoadingContext";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const { handleAsyncOperation } = useLoading();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  useEffect(() => {
    const initializeAdminAccess = async () => {
      try {
        // Use our new utility to check and refresh admin status
        const adminStatus = await checkAndRefreshAdminStatus();
        console.log(
          "Admin status in UserManagement after refresh:",
          adminStatus
        );

        setHasAdminAccess(adminStatus);

        if (adminStatus) {
          // If we have admin access, fetch users
          fetchUsers();
        } else {
          // If we don't have admin access, show error
          console.log("User does not have admin access");
          showAccessDeniedError();
        }
      } catch (error) {
        console.error("Error initializing admin access:", error);
        showAccessDeniedError();
      }
    };

    initializeAdminAccess();
  }, []);

  // Show access denied error
  const showAccessDeniedError = () => {
    Swal.fire({
      title: "Access Denied",
      text: "You don't have administrator privileges to manage users.",
      icon: "error",
      confirmButtonText: "OK",
    });
  };
  const fetchUsers = async () => {
    try {
      // Double check admin access before fetching users
      const adminStatus = isAdmin();
      console.log("Admin status check in fetchUsers:", adminStatus);

      // Development override
      const devOverride =
        import.meta.env.DEV &&
        (window.location.search.includes("admin=true") ||
          import.meta.env.VITE_ALWAYS_ADMIN === "true");

      if (!adminStatus && !devOverride) {
        console.warn("Admin access check failed when trying to fetch users");
        setHasAdminAccess(false);
        throw new Error("Unauthorized: Administrator access required");
      }

      setHasAdminAccess(true); // Ensure state is updated properly

      // Force admin headers to be included for this request
      if (devOverride) {
        console.log("Setting admin flag for development");
        sessionStorage.setItem("isAdmin", "true");
      }

      console.log(
        "Fetching users with admin status:",
        adminStatus || devOverride
      );

      const data = await handleAsyncOperation(
        () => getAllUsers(),
        "Fetching users"
      );

      if (!data || !Array.isArray(data)) {
        console.error("Received invalid data format for users:", data);
        throw new Error("Received invalid data format from server");
      }
      console.log(`Fetched ${data.length} users successfully`);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);

      // Only show error if it's not an auth error (we already handle that separately)
      if (!error.message?.includes("Unauthorized")) {
        Swal.fire({
          title: "Error",
          text:
            error.message ||
            "Failed to load users. Please check your permissions and try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };
  const handleCancelEdit = () => {
    handleCloseModal();
  };
  const handleSave = async (userId, updateData) => {
    try {
      // Verify admin access before updating user
      if (!isAdmin()) {
        throw new Error("Unauthorized: Administrator access required");
      }

      if (!userId) {
        throw new Error("No user selected for editing");
      }

      console.log("Updating user with ID:", userId, "Updates:", updateData);

      const updatedUser = await handleAsyncOperation(
        () => adminUpdateUser(userId, updateData),
        "Updating user"
      );

      console.log("User update response:", updatedUser); // If the API call succeeded, update the UI state
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, ...updateData } : user
        )
      );

      // Update filtered users as well
      setFilteredUsers(
        filteredUsers.map((user) =>
          user._id === userId ? { ...user, ...updateData } : user
        )
      );

      Swal.fire({
        title: "Success",
        text: "User updated successfully",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error updating user:", error);

      // Provide more detailed error messages for common issues
      let errorMessage = error.message || "Failed to update user";

      if (error.message?.includes("Unauthorized")) {
        errorMessage =
          "You don't have permission to update this user. Please check your admin privileges.";
      } else if (error.message?.includes("Network Error")) {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });

      // Re-throw error to prevent modal from closing if there was an error
      throw error;
    }
  };
  const handleDelete = async (userId) => {
    // Verify admin access before deleting user
    if (!isAdmin()) {
      Swal.fire({
        title: "Access Denied",
        text: "You don't have administrator privileges to delete users.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!userId) {
      Swal.fire({
        title: "Error!",
        text: "Invalid user ID.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Check if user is admin
    const targetUser = users.find((user) => user._id === userId);
    if (targetUser && targetUser.isAdmin) {
      Swal.fire({
        title: "Cannot Delete Admin",
        text: "Administrator accounts cannot be deleted.",
        icon: "warning",
        confirmButtonText: "OK",
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
      cancelButtonText: "No, cancel",
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
          },
        });

        console.log("Deleting user with ID:", userId);
        await handleAsyncOperation(() => deleteUser(userId), "Deleting user"); // Update local state
        setUsers(users.filter((user) => user._id !== userId));
        setFilteredUsers(filteredUsers.filter((user) => user._id !== userId));

        Swal.fire({
          title: "Deleted!",
          text: "User has been successfully deleted.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Error deleting user:", error);

        let errorMessage = error.message || "Failed to delete user.";
        if (error.message?.includes("Unauthorized")) {
          errorMessage =
            "You don't have permission to delete this user. Please check your admin privileges.";
        }

        Swal.fire({
          title: "Error!",
          html: `<p>${errorMessage}</p>
                <p class="text-sm mt-2">If this problem persists, please contact the system administrator.</p>`,
          icon: "error",
          confirmButtonText: "OK",
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
        confirmButtonText: "OK",
      });
      return;
    }

    if (!userId) {
      Swal.fire({
        title: "Error!",
        text: "Invalid user ID.",
        icon: "error",
        confirmButtonText: "OK",
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
      ); // Update the user status in the list
      setUsers(
        users.map((user) =>
          user._id === userId
            ? {
                ...user,
                isPermanentlyLocked: false,
                lockUntil: null,
                failedLoginAttempts: 0,
                lastFailedAttemptAt: null,
              }
            : user
        )
      );

      // Update filtered users as well
      setFilteredUsers(
        filteredUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isPermanentlyLocked: false,
                lockUntil: null,
                failedLoginAttempts: 0,
                lastFailedAttemptAt: null,
              }
            : user
        )
      );

      Swal.fire({
        title: "Success!",
        text: "User account has been unlocked successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error unlocking user:", error);

      let errorMessage = error.message || "Failed to unlock user account.";
      if (error.message?.includes("Unauthorized")) {
        errorMessage =
          "You don't have permission to unlock this user. Please check your admin privileges.";
      }

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }; // Filter functionality
  const filterUsers = (filter) => {
    setActiveFilter(filter);
    let filtered = users;

    switch (filter) {
      case "admin":
        filtered = users.filter((user) => user.isAdmin);
        break;
      case "user":
        filtered = users.filter((user) => !user.isAdmin);
        break;
      case "active":
        filtered = users.filter(
          (user) =>
            !user.isPermanentlyLocked &&
            (!user.lockUntil || new Date(user.lockUntil) <= new Date())
        );
        break;
      case "locked":
        filtered = users.filter(
          (user) =>
            user.isPermanentlyLocked ||
            (user.lockUntil && new Date(user.lockUntil) > new Date())
        );
        break;
      default:
        filtered = users;
    }

    setFilteredUsers(filtered);
  };

  // Effect to update filtered users when users change
  useEffect(() => {
    filterUsers(activeFilter);
  }, [users]); // Re-filter when users array changes

  // Statistics
  const getStats = () => {
    const totalUsers = users.length;
    const adminCount = users.filter((user) => user.isAdmin).length;
    const userCount = users.filter((user) => !user.isAdmin).length;
    const activeCount = users.filter(
      (user) =>
        !user.isPermanentlyLocked &&
        (!user.lockUntil || new Date(user.lockUntil) <= new Date())
    ).length;
    const lockedCount = users.filter(
      (user) =>
        user.isPermanentlyLocked ||
        (user.lockUntil && new Date(user.lockUntil) > new Date())
    ).length;

    return { totalUsers, adminCount, userCount, activeCount, lockedCount };
  };
  const stats = getStats();
  return (
    <ClientOnlyWrapper
      fallback={
        <div className="overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-gray-700">
              User Management
            </h2>
            <div className="px-4 py-2 bg-gray-50 text-gray-500 text-sm font-medium rounded-md">
              Loading...
            </div>
          </div>
          <div className="animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-200 rounded-lg h-20"></div>
              ))}
            </div>
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium text-gray-700">
            User Management
          </h2>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors rounded-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <UserStatsOverview stats={stats} />

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "all", label: "All Users", count: stats.totalUsers },
                {
                  key: "admin",
                  label: "Administrators",
                  count: stats.adminCount,
                },
                { key: "user", label: "Regular Users", count: stats.userCount },
                { key: "active", label: "Active", count: stats.activeCount },
                { key: "locked", label: "Locked", count: stats.lockedCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => filterUsers(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeFilter === tab.key
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        <UserTable
          users={filteredUsers}
          editingUser={null}
          onEdit={handleEdit}
          onSave={null}
          onChange={null}
          onCancel={null}
          onDelete={handleDelete}
          onUnlock={handleUnlock}
        />

        {/* User Edit Modal */}
        <UserEditModal
          user={editingUser}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      </div>
    </ClientOnlyWrapper>
  );
}
