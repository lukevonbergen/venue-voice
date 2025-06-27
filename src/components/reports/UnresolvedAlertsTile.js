import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../../utils/supabase';

const UnresolvedAlertsTile = ({ venueId }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
  if (!venueId) return;

  const fetch = async () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .gte('created_at', startOfDay.toISOString());

    const grouped = {};
    for (const row of data || []) {
      if (!grouped[row.session_id]) grouped[row.session_id] = [];
      grouped[row.session_id].push(row);
    }

    const sessions = Object.values(grouped);

    const count = sessions.filter(session => {
      const createdAt = new Date(session[0].created_at);
      const isExpired = createdAt < twoHoursAgo;
      const hasLowScore = session.some(i => i.rating !== null && i.rating <= 2);
      const isUnresolved = !session.every(i => i.is_actioned);
      return !isExpired && hasLowScore && isUnresolved;
    }).length;

    setValue(count);
  };

  fetch();
}, [venueId]);


  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100 flex items-center space-x-4">
      <AlertTriangle className="w-6 h-6 text-red-600" />
      <div>
        <p className="text-sm text-gray-600">Today's Unresolved Alerts</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default UnresolvedAlertsTile;