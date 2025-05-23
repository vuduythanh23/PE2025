import Swal from "sweetalert2";

export default function AdminTable({
  users,
  editingUser,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Username</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">First Name</th>
            <th className="border border-gray-300 px-4 py-2">Last Name</th>
            <th className="border border-gray-300 px-4 py-2">Address</th>
            <th className="border border-gray-300 px-4 py-2">Phone</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border border-gray-300 px-4 py-2">{user._id}</td>
              <td className="border border-gray-300 px-4 py-2">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="username"
                    value={editingUser.username}
                    onChange={onChange}
                    className="w-full border rounded px-2 py-1"
                  />
                ) : (
                  user.username
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {editingUser?._id === user._id ? (
                  <input
                    type="email"
                    name="email"
                    value={editingUser.email}
                    onChange={onChange}
                    className="w-full border rounded px-2 py-1"
                  />
                ) : (
                  user.email
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="firstName"
                    value={editingUser.firstName}
                    onChange={onChange}
                    className="w-full border rounded px-2 py-1"
                  />
                ) : (
                  user.firstName
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="lastName"
                    value={editingUser.lastName}
                    onChange={onChange}
                    className="w-full border rounded px-2 py-1"
                  />
                ) : (
                  user.lastName
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="address"
                    value={editingUser.address}
                    onChange={onChange}
                    className="w-full border rounded px-2 py-1"
                  />
                ) : (
                  user.address
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {editingUser?._id === user._id ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editingUser.phoneNumber}
                    onChange={onChange}
                    className="w-full border rounded px-2 py-1"
                  />
                ) : (
                  user.phoneNumber
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <div className="flex gap-2">
                  {editingUser?._id === user._id ? (
                    <>
                      <button
                        onClick={onSave}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={onCancel}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onEdit(user)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      {!user.isAdmin && (
                        <button
                          onClick={() => onDelete(user._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
