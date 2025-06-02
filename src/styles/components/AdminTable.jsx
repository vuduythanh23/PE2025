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
                <span
                  className={`text-sm font-serif ${
                    user.accountLocked ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {user.accountLocked
                    ? user.unlockTime
                      ? "Temporarily Locked"
                      : "Permanently Locked"
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
                ) : (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-luxury-gold hover:text-luxury-dark transition-colors"
                    >
                      Edit
                    </button>
                    {user.accountLocked && (
                      <button
                        onClick={() => onUnlock(user._id)}
                        className="text-green-500 hover:text-green-600 transition-colors"
                      >
                        Unlock
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(user._id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      disabled={user.isAdmin}
                    >
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
