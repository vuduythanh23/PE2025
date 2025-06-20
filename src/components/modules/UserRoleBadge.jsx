import React from "react";

const UserRoleBadge = ({ user, showIcon = true, size = "sm" }) => {
  const isAdmin = user?.isAdmin;

  const sizes = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-sm",
  };

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  if (isAdmin) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-purple-100 text-purple-800 ${sizes[size]}`}
      >
        {showIcon && (
          <svg
            className={`mr-1 ${iconSizes[size]}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v6a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z"
              clipRule="evenodd"
            />
          </svg>
        )}
        Administrator
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-blue-100 text-blue-800 ${sizes[size]}`}
    >
      {showIcon && (
        <svg
          className={`mr-1 ${iconSizes[size]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      )}
      User
    </span>
  );
};

export default UserRoleBadge;
