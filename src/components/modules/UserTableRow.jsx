import React from 'react';
import ClientOnly from './ClientOnly';

const UserTableRow = ({ user, children }) => {
  return (
    <ClientOnly fallback={<tr className="hover:bg-gray-50">{children}</tr>}>
      <tr 
        className={`hover:bg-gray-50 transition-colors ${
          user?.isAdmin ? 'border-l-4 border-purple-500' : ''
        }`}
      >
        {children}
      </tr>
    </ClientOnly>
  );
};

export default UserTableRow;
