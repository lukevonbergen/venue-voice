import React from 'react';
import { ColorPicker, Tooltip } from 'antd';

const BrandingSettings = ({ logo, onLogoUpload, primaryColor, secondaryColor, onColorChange, colorsUpdated, onSaveColors, colorsMessage, loading }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Branding Settings</h2>
      <div className="flex items-center gap-6">
        {logo && (
          <img
            src={logo}
            alt="Venue Logo"
            className="max-w-[200px] max-h-[200px] object-contain"
          />
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={onLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          <label
            htmlFor="logo-upload"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200"
          >
            {loading ? 'Uploading...' : 'Upload Logo'}
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Recommended size: 200x200 pixels
          </p>
        </div>
      </div>
      {colorsMessage && <p className="text-sm text-red-500 mt-2">{colorsMessage}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        {/* Primary Color */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <Tooltip title="Primary color is used for text on the feedback collection page.">
              <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
          </div>
          <ColorPicker
            value={primaryColor}
            onChange={(color) => onColorChange('primary', color.toHexString())}
          />
        </div>

        {/* Secondary Color */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Secondary Color
            </label>
            <Tooltip title="Secondary color is used for the background on the feedback collection page.">
              <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
          </div>
          <ColorPicker
            value={secondaryColor}
            onChange={(color) => onColorChange('secondary', color.toHexString())}
          />
        </div>
      </div>
      {colorsUpdated && (
        <button
          onClick={onSaveColors}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Colors'}
        </button>
      )}
      {colorsMessage && <p className="text-sm text-red-500 mt-2">{colorsMessage}</p>}
    </div>
  );
};

export default BrandingSettings;