import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import { ColorPicker } from 'antd'; // Using Ant Design's ColorPicker for simplicity
import 'antd/dist/reset.css'; // Import Ant Design styles

const SettingsPage = () => {
  const [venueId, setVenueId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#1890ff'); // Default primary color
  const [secondaryColor, setSecondaryColor] = useState('#52c41a'); // Default secondary color
  const [isPaid, setIsPaid] = useState(false); // Subscription status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [colorsUpdated, setColorsUpdated] = useState(false);

  // Fetch venue ID and settings on component mount
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetchVenueId(user.email);
      }
    };

    fetchSession();
  }, []);

  // Fetch venue ID and all fields
  const fetchVenueId = async (email) => {
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id, name, email, first_name, last_name, logo, primary_color, secondary_color, is_paid')
      .eq('email', email)
      .single();

    if (venueError) {
      console.error('Error fetching venue ID:', venueError);
    } else {
      setVenueId(venueData.id);
      setName(venueData.name || '');
      setEmail(venueData.email || '');
      setFirstName(venueData.first_name || '');
      setLastName(venueData.last_name || '');
      setLogo(venueData.logo || null);
      setPrimaryColor(venueData.primary_color || '#1890ff');
      setSecondaryColor(venueData.secondary_color || '#52c41a');
      setIsPaid(venueData.is_paid || false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    // Step 1: Ensure the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('User is not authenticated.');
      setLoading(false);
      return;
    }

    // Step 2: Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${venueId}-logo.${fileExt}`; // Unique file name
    const filePath = `${fileName}`;

    // Step 3: Delete the existing file (if it exists)
    const { error: deleteError } = await supabase.storage
      .from('venue-logos')
      .remove([filePath]);

    if (deleteError && deleteError.message !== 'The resource was not found') {
      console.error('Error deleting existing logo:', deleteError);
      setError('Failed to delete existing logo. Please try again.');
      setLoading(false);
      return;
    }

    // Step 4: Upload the new file
    const { error: uploadError } = await supabase.storage
      .from('venue-logos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      setError('Failed to upload logo. Please try again.');
      setLoading(false);
      return;
    }

    // Step 5: Get the public URL of the uploaded logo
    const { data: { publicUrl } } = supabase.storage
      .from('venue-logos')
      .getPublicUrl(filePath);

    // Step 6: Update the `logo` column in the `venues` table
    const { error: updateError } = await supabase
      .from('venues')
      .update({ logo: publicUrl })
      .eq('id', venueId)
      .eq('owner_id', user.id); // Ensure the user is updating their own venue

    if (updateError) {
      console.error('Error updating logo:', updateError);
      setError('Failed to update logo. Please try again.');
    } else {
      setLogo(publicUrl); // Update the logo in the state
    }

    setLoading(false);
  };

  // Handle color change (only update state, not database)
  const handleColorChange = (type, color) => {
    if (type === 'primary') setPrimaryColor(color);
    if (type === 'secondary') setSecondaryColor(color);
    setColorsUpdated(true); // Mark colors as updated
  };

  // Save colors to the database
  const saveColors = async () => {
    setLoading(true);
    setError('');

    const updates = {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    };

    const { error: updateError } = await supabase
      .from('venues')
      .update(updates)
      .eq('id', venueId);

    if (updateError) {
      console.error('Error updating colors:', updateError);
      setError('Failed to update colors. Please try again.');
    } else {
      setColorsUpdated(false); // Reset the updated state
      setError('Colors updated successfully!');
    }

    setLoading(false);
  };

  // Save all settings (profile, logo, and colors)
  const saveAllSettings = async () => {
    setLoading(true);
    setError('');

    try {
      // Update profile
      const profileUpdates = {
        name,
        email,
        first_name: firstName,
        last_name: lastName,
      };
      await supabase
        .from('venues')
        .update(profileUpdates)
        .eq('id', venueId);

      // Update colors
      const colorUpdates = {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      };
      await supabase
        .from('venues')
        .update(colorUpdates)
        .eq('id', venueId);

      setError('All settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Profile Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Profile</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Subscription Status Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Subscription Status</h2>
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium text-gray-700">
              {isPaid ? 'Active Subscription' : 'No Active Subscription'}
            </span>
            {!isPaid && (
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                onClick={() => {
                  // Add logic to handle subscription upgrade
                  alert('Redirect to subscription upgrade page.');
                }}
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Logo Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Venue Logo</h2>
          <div className="flex items-center gap-6">
            {logo && (
              <img
                src={logo}
                alt="Venue Logo"
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
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
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Color Customization Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Custom Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <ColorPicker
                value={primaryColor}
                onChange={(color) => handleColorChange('primary', color.toHexString())}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <ColorPicker
                value={secondaryColor}
                onChange={(color) => handleColorChange('secondary', color.toHexString())}
              />
            </div>
          </div>
          {colorsUpdated && (
            <button
              onClick={saveColors}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Colors'}
            </button>
          )}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Save All Settings Button */}
        <div className="mt-8">
          <button
            onClick={saveAllSettings}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save All Settings'}
          </button>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </DashboardFrame>
  );
};

export default SettingsPage;