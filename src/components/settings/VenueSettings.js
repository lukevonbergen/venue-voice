import React from 'react';

const VenueSettings = ({ name, tableCount, address, onNameChange, onTableCountChange, onAddressChange, venueSettingsMessage, loading, onSave }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Venue Settings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
          <input
            type="text"
            value={name}
            onChange={onNameChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Table Count</label>
          <input
            type="number"
            value={tableCount}
            onChange={onTableCountChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Address Line 1"
              value={address.line1}
              onChange={(e) => onAddressChange({ ...address, line1: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Address Line 2"
              value={address.line2}
              onChange={(e) => onAddressChange({ ...address, line2: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="City"
              value={address.city}
              onChange={(e) => onAddressChange({ ...address, city: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="State"
              value={address.state}
              onChange={(e) => onAddressChange({ ...address, state: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={address.postalCode}
              onChange={(e) => onAddressChange({ ...address, postalCode: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Country"
              value={address.country}
              onChange={(e) => onAddressChange({ ...address, country: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
      <button
        onClick={onSave}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Venue Settings'}
      </button>
      {venueSettingsMessage && <p className="text-sm text-red-500 mt-2">{venueSettingsMessage}</p>}
    </div>
  );
};

export default VenueSettings;