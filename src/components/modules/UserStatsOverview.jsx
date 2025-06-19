import React from 'react';

const UserStatsCard = ({ title, count, color, icon, percentage }) => {
  const colorClasses = {
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm border ${colorClasses[color] || colorClasses.gray}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{count}</div>
          <div className="text-sm font-medium">{title}</div>
          {percentage !== undefined && (
            <div className="text-xs mt-1 opacity-75">
              {percentage.toFixed(1)}% of total
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white bg-opacity-50">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const UserStatsOverview = ({ stats }) => {
  const { totalUsers, adminCount, userCount, activeCount, lockedCount } = stats;

  const getPercentage = (count) => totalUsers > 0 ? (count / totalUsers) * 100 : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <UserStatsCard
        title="Total Users"
        count={totalUsers}
        color="gray"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        }
      />
      
      <UserStatsCard
        title="Administrators"
        count={adminCount}
        color="purple"
        percentage={getPercentage(adminCount)}
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v6a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clipRule="evenodd" />
          </svg>
        }
      />
      
      <UserStatsCard
        title="Regular Users"
        count={userCount}
        color="blue"
        percentage={getPercentage(userCount)}
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        }
      />
      
      <UserStatsCard
        title="Active"
        count={activeCount}
        color="green"
        percentage={getPercentage(activeCount)}
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        }
      />
      
      <UserStatsCard
        title="Locked"
        count={lockedCount}
        color="red"
        percentage={getPercentage(lockedCount)}
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        }
      />
    </div>
  );
};

export default UserStatsOverview;
