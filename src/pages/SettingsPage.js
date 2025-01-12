import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import { ColorPicker } from 'antd'; // Using Ant Design's ColorPicker for simplicity
import 'antd/dist/reset.css'; // Import Ant Design styles

const SettingsPage = () => {
  const [venueId, setVenueId] = useState(null);
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#1890ff'); // Default primary color
  const [secondaryColor, setSecondaryColor] = useState('#52c41a'); // Default secondary color
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Fetch venue ID
  const fetchVenueId = async (email) => {
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id, logo, primary_color, secondary_color')
      .eq('email', email)
      .single();

    if (venueError) {
      console.error('Error fetching venue ID:', venueError);
    } else {
      setVenueId(venueData.id);
      setLogo(venueData.logo); // Set existing logo
      setPrimaryColor(venueData.primary_color || '#1890ff'); // Set existing primary color
      setSecondaryColor(venueData.secondary_color || '#52c41a'); // Set existing secondary color
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    // Upload the file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${venueId}-logo.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('venue-logos') // Create a bucket named 'venue-logos' in Supabase Storage
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      setError('Failed to upload logo. Please try again.');
      setLoading(false);
      return;
    }

    // Get the public URL of the uploaded logo
    const { data: { publicUrl } } = supabase.storage
      .from('venue-logos')
      .getPublicUrl(filePath);

    // Update the venue's logo in the database
    const { error: updateError } = await supabase
      .from('venues')
      .update({ logo: publicUrl })
      .eq('id', venueId);

    if (updateError) {
      console.error('Error updating logo:', updateError);
      setError('Failed to update logo. Please try again.');
    } else {
      setLogo(publicUrl); // Update the logo in the state
    }

    setLoading(false);
  };

  // Handle color change
  const handleColorChange = async (type, color) => {
    setLoading(true);
    setError('');

    const updates = {
      primary_color: type === 'primary' ? color : primaryColor,
      secondary_color: type === 'secondary' ? color : secondaryColor,
    };

    // Update the venue's colors in the database
    const { error: updateError } = await supabase
      .from('venues')
      .update(updates)
      .eq('id', venueId);

    if (updateError) {
      console.error('Error updating colors:', updateError);
      setError('Failed to update colors. Please try again.');
    } else {
      if (type === 'primary') setPrimaryColor(color);
      if (type === 'secondary') setSecondaryColor(color);
    }

    setLoading(false);
  };

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

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
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </DashboardFrame>
  );
};

export default SettingsPage;