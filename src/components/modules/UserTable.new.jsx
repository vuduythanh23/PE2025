import React from "react";

const UserTable = ({ users, onEdit, onDelete, onUnlock }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                        user.isAdmin ? "bg-purple-600" : "bg-blue-600"
                      }`}
                    >
                      {user.username
                        ? user.username.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {user.username}
                      </div>
                      {user.isAdmin && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">ID: {user._id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isAdmin
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.isAdmin ? "Administrator" : "User"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="text-sm text-gray-900 font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  {user.firstName || user.lastName ? "" : "Name not provided"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.phoneNumber || "-"}
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
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-amber-600 hover:text-amber-800 transition-colors font-medium"
                  >
                    Edit
                  </button>
                  {(user.isPermanentlyLocked ||
                    (user.lockUntil && new Date(user.lockUntil) > new Date()) ||
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
                    title={
                      user.isAdmin
                        ? "Cannot delete administrator accounts"
                        : "Delete user"
                    }
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
