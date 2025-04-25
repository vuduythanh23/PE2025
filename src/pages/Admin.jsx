import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../utils/api"; // API functions
import Swal from "sweetalert2";
import Header from "../components/layout/header";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await getAllUsers();
        // Filter out admin user
        setUsers(data.filter((user) => user.username !== "admin"));
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

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((user) => user._id !== userId)); // Remove user from state
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
    return <div>Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel - User Management</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Username</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border border-gray-300 px-4 py-2">{user._id}</td>
              <td className="border border-gray-300 px-4 py-2">{user.username}</td>
              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded  hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  
  );
}