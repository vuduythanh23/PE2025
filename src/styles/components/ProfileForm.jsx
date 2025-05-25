export default function ProfileForm({
  user,
  editing,
  errors,
  loading,
  onEdit,
  onChange,
  onSave,
  onCancel,
}) {
  return (    <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-luxury-dark">My Profile</h2>
          <div className="w-16 h-0.5 bg-luxury-gold mt-4"></div>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            className="px-6 py-3 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-colors font-serif text-sm tracking-wider"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={onSave} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-serif text-luxury-dark/70 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={onChange}
              disabled={!editing}
              className={`w-full p-3 border-b bg-transparent font-serif
                ${editing ? 'border-luxury-gold/30 focus:border-luxury-gold' : 'border-gray-200'} 
                ${errors.email ? "border-red-500" : ""}
                disabled:bg-gray-50 disabled:text-luxury-dark/50`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 font-serif">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-serif text-luxury-dark/70 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={user.firstName}
              onChange={onChange}
              disabled={!editing}
              className="w-full p-3 border-b border-luxury-gold/30 bg-transparent font-serif disabled:border-gray-200 disabled:bg-gray-50 disabled:text-luxury-dark/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-serif text-luxury-dark/70 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={user.lastName}
              onChange={onChange}
              disabled={!editing}
              className="w-full p-3 border-b border-luxury-gold/30 bg-transparent font-serif disabled:border-gray-200 disabled:bg-gray-50 disabled:text-luxury-dark/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-serif text-luxury-dark/70 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={user.phoneNumber}
              onChange={onChange}
              disabled={!editing}
              className={`w-full p-3 border-b border-luxury-gold/30 bg-transparent font-serif
                ${errors.phoneNumber ? "border-red-500" : ""}
                disabled:border-gray-200 disabled:bg-gray-50 disabled:text-luxury-dark/50`}
              required
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1 font-serif">{errors.phoneNumber}</p>
            )}
          </div>

          {editing && (
            <div>
              <label className="block text-sm font-serif text-luxury-dark/70 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={onChange}
                className={`w-full p-3 border-b border-luxury-gold/30 bg-transparent font-serif ${
                  errors.password ? "border-red-500" : ""
                }`}
                placeholder="Leave blank to keep current password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 font-serif">{errors.password}</p>
              )}
            </div>
          )}
        </div>

        {editing && (
          <div className="flex justify-end space-x-4 mt-12">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-luxury-gold/30 text-luxury-dark/70 hover:border-luxury-gold hover:text-luxury-dark transition-colors font-serif text-sm tracking-wider"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-luxury-gold text-white hover:bg-luxury-dark transition-colors font-serif text-sm tracking-wider"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
