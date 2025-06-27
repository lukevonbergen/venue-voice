import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const VenueContext = createContext();

export const useVenue = () => useContext(VenueContext);

export const VenueProvider = ({ children }) => {
  const [venueName, setVenueName] = useState('');
  const [venueId, setVenueId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('venues')
        .select('id, name')
        .eq('email', user.email)
        .single();

      if (!error && data) {
        setVenueName(data.name);
        setVenueId(data.id);
      }

      setLoading(false);
    };

    fetchVenue();
  }, []);

  return (
    <VenueContext.Provider value={{ venueName, venueId, loading }}>
      {children}
    </VenueContext.Provider>
  );
};
