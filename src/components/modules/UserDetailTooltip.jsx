import React, { useState } from "react";
import UserRoleBadge from "./UserRoleBadge";
import UserStatusBadge from "./UserStatusBadge";
import ClientOnly from "./ClientOnly";

const UserDetailTooltip = ({ user, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!user) return children;

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-pointer"
      >
        {children}
      </div>
      {showTooltip && (
        <ClientOnly>
          <div className="absolute z-50 w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg top-full left-0 mt-2">
            <div className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-sm font-medium text-white ${
                  user.isAdmin ? "bg-purple-600" : "bg-blue-600"
                }`}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "?"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </h4>
                  <UserRoleBadge user={user} size="xs" />
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="font-medium">Name:</span> {user.firstName}{" "}
                    {user.lastName}
                  </div>
                  {user.phoneNumber && (
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {user.phoneNumber}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">ID:</span> {user._id}
                  </div>
                </div>

                <div className="mt-2">
                  <UserStatusBadge user={user} size="xs" />
                </div>

                {(user.failedLoginAttempts > 0 || user.lastFailedAttemptAt) && (
                  <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                    <div className="text-orange-800 font-medium">
                      Security Info:
                    </div>
                    {user.failedLoginAttempts > 0 && (
                      <div>
                        Failed login attempts: {user.failedLoginAttempts}
                      </div>
                    )}
                    {user.lastFailedAttemptAt && (
                      <div>
                        Last failed attempt:{" "}
                        {new Date(user.lastFailedAttemptAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ClientOnly>
      )}
    </div>
  );
};

export default UserDetailTooltip;
