import React from "react";
import Swal from "sweetalert2";

const UserTable = ({
  users,
  editingUser,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
  onUnlock,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              First Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              Last Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user._id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="username"
                    value={editingUser.username}
                    onChange={onChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{user.username}</div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser?._id === user._id ? (
                  <input
                    type="email"
                    name="email"
                    value={editingUser.email}
                    onChange={onChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{user.email}</div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="firstName"
                    value={editingUser.firstName}
                    onChange={onChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{user.firstName}</div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="lastName"
                    value={editingUser.lastName}
                    onChange={onChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{user.lastName}</div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editingUser.phoneNumber || ""}
                    onChange={onChange}
                    placeholder="Enter phone number"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-gray-900">
                    {user.phoneNumber || "-"}
                  </div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                {editingUser?._id === user._id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSave(editingUser)}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={onCancel}
                      className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    {(user.isPermanentlyLocked ||
                      (user.lockUntil && new Date(user.lockUntil) > new Date()) ||
                      user.failedLoginAttempts > 0) && (
                      <button
                        onClick={() => onUnlock(user._id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Unlock
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(user._id)}
                      className={`${
                        user.isAdmin
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-red-600 hover:text-red-900"
                      }`}
                      disabled={user.isAdmin}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>      </table>
    </div>
  );
};

export default UserTable;
