import React from "react";
import Swal from "sweetalert2";

const UserTable = ({
  users,
  onEdit,
  onDelete,
  onUnlock,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              First Name
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Name
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>{" "}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user._id}
              </td>              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.username}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="text-sm text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="text-sm text-gray-900">{user.firstName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="text-sm text-gray-900">{user.lastName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="text-sm text-gray-900">
                  {user.phoneNumber || "-"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isPermanentlyLocked || user.lockUntil
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.isPermanentlyLocked
                    ? "Permanently Locked"
                    : user.lockUntil && new Date(user.lockUntil) > new Date()
                    ? "Temporarily Locked"
                    : "Active"}
                </span>
              </td>              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-amber-600 hover:text-amber-800 transition-colors font-medium"
                  >
                    Edit
                  </button>
                  {(user.isPermanentlyLocked ||
                    (user.lockUntil &&
                      new Date(user.lockUntil) > new Date()) ||
                    user.failedLoginAttempts > 0) && (
                    <button
                      onClick={() => onUnlock(user._id)}
                      className="text-green-600 hover:text-green-800 transition-colors font-medium"
                    >
                      Unlock
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(user._id)}
                    className={`transition-colors font-medium ${
                      user.isAdmin
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:text-red-800"
                    }`}
                    disabled={user.isAdmin}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
