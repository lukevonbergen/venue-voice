import React from 'react';

const SubscriptionStatus = ({ isPaid, onUpgrade }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Subscription Status</h2>
      <div className="flex items-center gap-4">
        <span className="text-lg font-medium text-gray-700">
          {isPaid ? 'Active Subscription' : 'No Active Subscription'}
        </span>
        {!isPaid && (
          <button
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
            onClick={onUpgrade}
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;