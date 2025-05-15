// Full Heatmap.js with session-based feedback modal
import React, { useEffect, useRef, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import Draggable from 'react-draggable';
import { v4 as uuidv4 } from 'uuid';
import usePageTitle from '../hooks/usePageTitle';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const GRID_SIZE = 20;

const Heatmap = () => {
  usePageTitle('Heatmap');
  const layoutRef = useRef(null);

  const [venueId, setVenueId] = useState(null);
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [tables, setTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableShape, setNewTableShape] = useState('square');
  const [saving, setSaving] = useState(false);
  const [tableLimit, setTableLimit] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState({});

  const [selectedTable, setSelectedTable] = useState(null);
  const [feedbackModalData, setFeedbackModalData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData?.user?.email;
      if (!email) return;

      const { data: venue } = await supabase
        .from('venues')
        .select('id, table_count')
        .eq('email', email)
        .single();

      if (!venue) return;
      setVenueId(venue.id);
      setTableLimit(venue.table_count);

      await loadZones(venue.id);
      await loadTables(venue.id);
      await fetchFeedback(venue.id);
    };
    load();
  }, []);

  const loadZones = async (venueId) => {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('venue_id', venueId)
      .order('order');

    if (!error) {
      setZones(data);
      if (data.length > 0 && !selectedZoneId) setSelectedZoneId(data[0].id);
    }
  };

  const loadTables = async (venueId) => {
    const container = layoutRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const { data } = await supabase.from('table_positions').select('*').eq('venue_id', venueId);
    const loaded = data.map(t => ({ ...t, x_px: (t.x_percent / 100) * width, y_px: (t.y_percent / 100) * height }));
    setTables(loaded);
  };

  const fetchFeedback = async (venueId) => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    const sessionMap = {}, latestSession = {}, ratings = {};
    for (const entry of data) {
      const table = entry.table_number;
      if (!table) continue;
      if (!latestSession[table]) {
        latestSession[table] = entry.session_id;
        sessionMap[table] = [entry];
      } else if (entry.session_id === latestSession[table]) {
        sessionMap[table].push(entry);
      }
    }

    for (const table in sessionMap) {
      const valid = sessionMap[table].filter(e => e.rating !== null && !e.is_actioned).map(e => e.rating);
      ratings[table] = valid.length > 0 ? valid.reduce((a, b) => a + b) / valid.length : null;
    }
    setFeedbackMap(ratings);
  };

  const openFeedbackModal = async (tableNumber) => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .eq('table_number', tableNumber)
      .order('created_at', { ascending: false });

    setFeedbackModalData(data);
    setSelectedTable(tableNumber);
  };

  const markResolved = async (feedbackId) => {
    await supabase.from('feedback').update({ is_actioned: true, resolved_at: new Date() }).eq('id', feedbackId);
    await fetchFeedback(venueId);
    setFeedbackModalData(prev => prev.map(f => f.id === feedbackId ? { ...f, is_actioned: true } : f));
  };

  const undoResolved = async (feedbackId) => {
    await supabase.from('feedback').update({ is_actioned: false, resolved_at: null }).eq('id', feedbackId);
    await fetchFeedback(venueId);
    setFeedbackModalData(prev => prev.map(f => f.id === feedbackId ? { ...f, is_actioned: false } : f));
  };

  const FeedbackModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <h3 className="text-lg font-semibold mb-4">Feedback for Table {selectedTable}</h3>
        <button onClick={() => setSelectedTable(null)} className="absolute top-2 right-2 text-gray-400 hover:text-black">✕</button>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {feedbackModalData.map(f => (
            <div key={f.id} className="border rounded p-3">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Session: {f.session_id?.slice(0, 8)}</span>
                <span>{dayjs(f.created_at).fromNow()}</span>
              </div>
              <div className="mb-1 text-sm">Rating: {f.rating ?? 'N/A'}</div>
              {f.sentiment && <div className="text-sm">Sentiment: {f.sentiment}</div>}
              {f.additional_feedback && <div className="text-sm italic text-gray-700">"{f.additional_feedback}"</div>}
              <div className="mt-2">
                {f.is_actioned ? (
                  <button onClick={() => undoResolved(f.id)} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">Undo</button>
                ) : (
                  <button onClick={() => markResolved(f.id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Mark Resolved</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const getFeedbackColor = (avg) => {
    if (avg === null || avg === undefined) return 'bg-blue-500';
    if (avg > 4) return 'bg-green-500';
    if (avg >= 2.5) return 'bg-amber-400';
    return 'bg-red-600';
  };

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold mb-6">Table Heatmap</h1>

      <div className="bg-white border rounded p-6">
        <div className="relative w-full h-[600px] bg-white border rounded" ref={layoutRef}>
          {tables.filter(t => t.zone_id === selectedZoneId).map((t) => {
            const avgRating = feedbackMap[t.table_number];
            const feedbackColor = getFeedbackColor(avgRating);
            const shape = t.shape === 'circle' ? 'w-14 h-14 rounded-full bg-gray-700' : t.shape === 'long' ? 'w-28 h-10 rounded bg-gray-700' : 'w-14 h-14 rounded bg-gray-700';

            const node = (
              <div className="absolute">
                <div className="relative">
                  <div
                    className={`text-white flex items-center justify-center font-bold border-2 border-black shadow cursor-pointer ${shape}`}
                    onClick={() => !editMode && openFeedbackModal(t.table_number)}
                  >
                    {t.table_number}
                  </div>
                  {!editMode && (
                    <div
                      className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${feedbackColor} ${feedbackColor === 'bg-red-600' ? 'animate-pulse' : ''}`}
                      title={avgRating == null ? 'No feedback yet' : `Avg rating: ${avgRating.toFixed(1)}`}
                    />
                  )}
                </div>
              </div>
            );

            return editMode ? (
              <Draggable
                key={t.id}
                position={{ x: t.x_px, y: t.y_px }}
                bounds="parent"
                onStop={(e, data) => {
                  const x = Math.round(data.x / GRID_SIZE) * GRID_SIZE;
                  const y = Math.round(data.y / GRID_SIZE) * GRID_SIZE;
                  setTables(prev => prev.map(tab => tab.id === t.id ? { ...tab, x_px: x, y_px: y } : tab));
                  setHasUnsavedChanges(true);
                }}
              >
                {node}
              </Draggable>
            ) : (
              <div key={t.id} className="absolute" style={{ left: t.x_px, top: t.y_px }}>
                {node}
              </div>
            );
          })}
        </div>
      </div>

      {selectedTable && <FeedbackModal />}
    </PageContainer>
  );
};

export default Heatmap;