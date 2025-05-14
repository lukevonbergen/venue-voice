import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import supabase from '../../utils/supabase';

const UnresolvedAlertsTile = ({ venueId }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!venueId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('venue_id', venueId);

      const grouped = {};
      for (const row of data || []) {
        if (!grouped[row.session_id]) grouped[row.session_id] = [];
        grouped[row.session_id].push(row);
      }

      const sessions = Object.values(grouped);
      const count = sessions.filter(s => s.some(i => i.rating !== null && i.rating <= 2) && !s.every(i => i.is_actioned)).length;
      setValue(count);
    };

    fetch();
  }, [venueId]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 flex items-center space-x-4">
      <AlertTriangle className="w-6 h-6 text-red-600" />
      <div>
        <p className="text-sm text-gray-600">Unresolved Alerts</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default UnresolvedAlertsTile;