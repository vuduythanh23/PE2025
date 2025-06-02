import Swal from "sweetalert2";

export default function AdminTable({
  users,
  editingUser,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
  onUnlock,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-luxury-forest/5">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-serif text-luxury-dark">
              ID
            </th>
            <th className="px-6 py-4 text-left text-sm font-serif text-luxury-dark">
              Username
            </th>
            <th className="px-6 py-4 text-left text-sm font-serif text-luxury-dark">
              Email
            </th>
            <th className="px-6 py-4 text-left text-sm font-serif text-luxury-dark">
              First Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-serif text-luxury-dark">
              Last Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-serif text-luxury-dark">
              Phone
            </th>
            <th className="px-6 py-4 text-left text-sm font-serif text-luxury-dark">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-serif text-luxury-dark">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-luxury-gold/10">
          {users.map((user) => (
            <tr key={user._id} className="group">
              <td className="px-6 py-4 text-sm text-luxury-dark/70 font-serif">
                {user._id}
              </td>
              <td className="px-6 py-4">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="username"
                    value={editingUser.username}
                    onChange={onChange}
                    className="w-full p-2 border-b border-luxury-gold/30 bg-transparent font-serif focus:outline-none focus:border-luxury-gold"
                  />
                ) : (
                  <span className="text-sm text-luxury-dark font-serif">
                    {user.username}
                  </span>
                )}
              </td>

              <td className="px-6 py-4">
                {editingUser?._id === user._id ? (
                  <input
                    type="email"
                    name="email"
                    value={editingUser.email}
                    onChange={onChange}
                    className="w-full p-2 border-b border-luxury-gold/30 bg-transparent font-serif focus:outline-none focus:border-luxury-gold"
                  />
                ) : (
                  <span className="text-sm text-luxury-dark/70 font-serif">
                    {user.email}
                  </span>
                )}
              </td>

              <td className="px-6 py-4">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="firstName"
                    value={editingUser.firstName}
                    onChange={onChange}
                    className="w-full p-2 border-b border-luxury-gold/30 bg-transparent font-serif focus:outline-none focus:border-luxury-gold"
                  />
                ) : (
                  <span className="text-sm text-luxury-dark font-serif">
                    {user.firstName}
                  </span>
                )}
              </td>

              <td className="px-6 py-4">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="lastName"
                    value={editingUser.lastName}
                    onChange={onChange}
                    className="w-full p-2 border-b border-luxury-gold/30 bg-transparent font-serif focus:outline-none focus:border-luxury-gold"
                  />
                ) : (
                  <span className="text-sm text-luxury-dark font-serif">
                    {user.lastName}
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {editingUser?._id === user._id ? (
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editingUser.phoneNumber || ''}
                    onChange={onChange}
                    placeholder="Enter phone number"
                    className="w-full p-2 border-b border-luxury-gold/30 bg-transparent font-serif focus:outline-none focus:border-luxury-gold"
                  />
                ) : (
                  <span className="text-sm text-luxury-dark font-serif">
                    {user.phoneNumber || '-'}
                  </span>
                )}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`text-sm font-serif ${
                    user.isPermanentlyLocked || user.lockUntil
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {user.isPermanentlyLocked
                    ? "Permanently Locked"
                    : user.lockUntil && new Date(user.lockUntil) > new Date()
                      ? "Temporarily Locked"
                      : "Active"}
                </span>
              </td>

              <td className="px-6 py-4">
                {editingUser?._id === user._id ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSave(editingUser)}
                      className="px-4 py-2 bg-luxury-gold text-white text-sm font-serif tracking-wider hover:bg-luxury-dark transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={onCancel}
                      className="px-4 py-2 border border-luxury-gold/30 text-luxury-dark/70 text-sm font-serif tracking-wider hover:border-luxury-gold hover:text-luxury-dark transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(user)}
                      className="px-3 py-1 text-sm text-luxury-gold hover:bg-luxury-gold/10 rounded transition-colors flex items-center"
                      title="Edit user information"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    {(user.isPermanentlyLocked || (user.lockUntil && new Date(user.lockUntil) > new Date()) || user.failedLoginAttempts > 0) && (
                      <button
                        onClick={() => onUnlock(user._id)}
                        className="px-3 py-1 text-sm text-green-500 hover:bg-green-50 rounded transition-colors flex items-center"
                        title="Unlock user account"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Unlock
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(user._id)}
                      className={`px-3 py-1 text-sm ${user.isAdmin ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'} rounded transition-colors flex items-center`}
                      disabled={user.isAdmin}
                      title={user.isAdmin ? "Admin accounts cannot be deleted" : "Delete this user account"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
