import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabase';
import Template1 from '../components/QRTemplates/Template1';
import Template2 from '../components/QRTemplates/Template2';

const QRTemplates = () => {
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#1890ff');
  const [secondaryColor, setSecondaryColor] = useState('#52c41a');
  const [loading, setLoading] = useState(true);
  const [feedbackUrl, setFeedbackUrl] = useState('');

  // Fetch branding data and feedback URL
  useEffect(() => {
    const fetchBrandingData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not logged in');

        // Fetch venue data
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('logo, primary_color, secondary_color, feedback_url')
          .eq('email', userData.user.email)
          .single();

        if (venueError) throw venueError;

        setLogo(venueData.logo);
        setPrimaryColor(venueData.primary_color || '#1890ff');
        setSecondaryColor(venueData.secondary_color || '#52c41a');
        setFeedbackUrl(venueData.feedback_url || 'https://example.com/feedback');
      } catch (error) {
        console.error('Error fetching branding data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandingData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">QR Code Templates</h1>

        {/* Template 1 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Template 1</h2>
          <Template1
            logo={logo}
            feedbackUrl={feedbackUrl}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>

        {/* Template 2 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Template 2</h2>
          <Template2
            logo={logo}
            feedbackUrl={feedbackUrl}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </div>

        {/* Add more templates as needed */}
      </div>
  );
};

export default QRTemplates;