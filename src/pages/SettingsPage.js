import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import DashboardFrame from './DashboardFrame';
import AccountSettings from '../components/settings/AccountSettings';
import VenueSettings from '../components/settings/VenueSettings';
import BrandingSettings from '../components/settings/BrandingSettings';
import SubscriptionStatus from '../components/settings/SubscriptionStatus';

const SettingsPage = () => {
  const [venueId, setVenueId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#1890ff');
  const [secondaryColor, setSecondaryColor] = useState('#52c41a');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [colorsUpdated, setColorsUpdated] = useState(false);
  const [tableCount, setTableCount] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // Separate state for success/error messages
  const [profileMessage, setProfileMessage] = useState('');
  const [logoMessage, setLogoMessage] = useState('');
  const [colorsMessage, setColorsMessage] = useState('');
  const [allSettingsMessage, setAllSettingsMessage] = useState('');
  const [venueSettingsMessage, setVenueSettingsMessage] = useState('');

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
      .select('id, name, email, first_name, last_name, logo, primary_color, secondary_color, is_paid, table_count, address')
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
      setTableCount(venueData.table_count || '');
      setAddress(venueData.address || {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      });
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setLoading(true);
    setLogoMessage('');
  
    // Step 1: Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${venueId}-logo.${fileExt}`; // Unique file name
    const filePath = `${fileName}`;
  
    // Step 2: Delete the existing file (if it exists)
    const { error: deleteError } = await supabase.storage
      .from('venue-logos')
      .remove([filePath]);
  
    if (deleteError && deleteError.message !== 'The resource was not found') {
      console.error('Error deleting existing logo:', deleteError);
      setLogoMessage('Failed to delete existing logo. Please try again.');
      setLoading(false);
      return;
    }
  
    // Step 3: Upload the new file
    const { error: uploadError } = await supabase.storage
      .from('venue-logos')
      .upload(filePath, file);
  
    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      setLogoMessage('Failed to upload logo. Please try again.');
      setLoading(false);
      return;
    }
  
    // Step 4: Get the public URL of the uploaded logo
    const { data: { publicUrl } } = supabase.storage
      .from('venue-logos')
      .getPublicUrl(filePath);
  
    // Step 5: Update the `logo` column in the `venues` table
    const { error: updateError } = await supabase
      .from('venues')
      .update({ logo: publicUrl })
      .eq('id', venueId); // Update based on venueId only
  
    if (updateError) {
      console.error('Error updating logo:', updateError);
      setLogoMessage('Failed to update logo. Please try again.');
    } else {
      setLogo(publicUrl); // Update the logo in the state
      setLogoMessage('Logo updated successfully!');
    }
  
    setLoading(false);
  };

  const handleColorChange = (type, color) => {
    if (type === 'primary') setPrimaryColor(color);
    if (type === 'secondary') setSecondaryColor(color);
    setColorsUpdated(true); // Mark colors as updated
  };

  const saveColors = async () => {
    setLoading(true);
    setColorsMessage('');

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
      setColorsMessage('Failed to update colors. Please try again.');
    } else {
      setColorsUpdated(false); // Reset the updated state
      setColorsMessage('Colors updated successfully!');
    }

    setLoading(false);
  };

  const saveVenueSettings = async () => {
    setLoading(true);
    setVenueSettingsMessage('');

    try {
      const updates = {
        name,
        table_count: tableCount,
        address,
      };

      await supabase
        .from('venues')
        .update(updates)
        .eq('id', venueId);

      setVenueSettingsMessage('Venue settings updated successfully!');
    } catch (error) {
      console.error('Error updating venue settings:', error);
      setVenueSettingsMessage('Failed to update venue settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveAllSettings = async () => {
    setLoading(true);
    setAllSettingsMessage('');

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

      // Update venue settings
      const venueUpdates = {
        table_count: tableCount,
        address,
      };
      await supabase
        .from('venues')
        .update(venueUpdates)
        .eq('id', venueId);

      setAllSettingsMessage('All settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      setAllSettingsMessage('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const feedbackUrl = `${window.location.origin}/feedback/${venueId}`;

  return (
    <DashboardFrame>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* Account Settings */}
        <AccountSettings
          name={name}
          email={email}
          firstName={firstName}
          lastName={lastName}
          onNameChange={(e) => setName(e.target.value)}
          onEmailChange={(e) => setEmail(e.target.value)}
          onFirstNameChange={(e) => setFirstName(e.target.value)}
          onLastNameChange={(e) => setLastName(e.target.value)}
          profileMessage={profileMessage}
        />

        {/* Subscription Status */}
        <SubscriptionStatus
          isPaid={isPaid}
          onUpgrade={() => alert('Redirect to subscription upgrade page.')}
        />

        {/* Venue Settings */}
        <VenueSettings
          name={name}
          tableCount={tableCount}
          address={address}
          onNameChange={(e) => setName(e.target.value)}
          onTableCountChange={(e) => setTableCount(e.target.value)}
          onAddressChange={setAddress}
          venueSettingsMessage={venueSettingsMessage}
          loading={loading}
          onSave={saveVenueSettings}
        />

        {/* Branding Settings */}
        <BrandingSettings
          logo={logo}
          onLogoUpload={handleLogoUpload}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onColorChange={handleColorChange}
          colorsUpdated={colorsUpdated}
          onSaveColors={saveColors}
          colorsMessage={colorsMessage}
          loading={loading}
        />

        {/* Save All Settings Button */}
        <div className="mt-8">
          <button
            onClick={saveAllSettings}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save All Settings'}
          </button>
          {allSettingsMessage && <p className="text-sm text-red-500 mt-2">{allSettingsMessage}</p>}
        </div>
      </div>
    </DashboardFrame>
  );
};

export default SettingsPage;