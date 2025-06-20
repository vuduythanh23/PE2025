import React from "react";

const UserStatusBadge = ({ user, size = "sm" }) => {
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

  const isLocked =
    user?.isPermanentlyLocked ||
    (user?.lockUntil && new Date(user.lockUntil) > new Date());
  const isPermanentlyLocked = user?.isPermanentlyLocked;
  const isTemporarilyLocked =
    user?.lockUntil && new Date(user.lockUntil) > new Date();

  if (isPermanentlyLocked) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-red-100 text-red-800 ${sizes[size]}`}
      >
        <svg
          className={`mr-1 ${iconSizes[size]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Permanently Locked
      </span>
    );
  }

  if (isTemporarilyLocked) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-orange-100 text-orange-800 ${sizes[size]}`}
      >
        <svg
          className={`mr-1 ${iconSizes[size]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Temporarily Locked
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-green-100 text-green-800 ${sizes[size]}`}
    >
      <svg
        className={`mr-1 ${iconSizes[size]}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Active
    </span>
  );
};

export default UserStatusBadge;
