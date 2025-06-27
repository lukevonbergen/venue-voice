import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const AvgSatisfactionTile = ({ venueId }) => {
  const [value, setValue] = useState('N/A');

  useEffect(() => {
    if (!venueId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('feedback')
        .select('rating')
        .eq('venue_id', venueId);

      const ratings = (data || []).map(d => d.rating).filter(r => r >= 1 && r <= 5);
      if (ratings.length) {
        const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
        setValue(avg);
      }
    };

    fetch();
  }, [venueId]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 flex items-center space-x-4">
      <BarChart3 className="w-6 h-6 text-indigo-600" />
      <div>
        <p className="text-sm text-gray-600">Avg. Customer Satisfaction (1–5)</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default AvgSatisfactionTile;