import React, { useEffect, useRef, useState } from 'react';
import supabase from '../utils/supabase';
import PageContainer from '../components/PageContainer';
import Modal from 'react-modal';

import TableNode from '../components/heatmap/TableNode';
import TableModal from '../components/heatmap/TableModal';
import TableEditorPanel from '../components/heatmap/TableEditorPanel';

import { v4 as uuidv4 } from 'uuid';

const Heatmap = () => {
  const layoutRef = useRef(null);

  const [venueId, setVenueId] = useState(null);
  const [positions, setPositions] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [latestSessions, setLatestSessions] = useState({});
  const [unresolvedTables, setUnresolvedTables] = useState({});
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newShape, setNewShape] = useState('square');
  const [newTableNumber, setNewTableNumber] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [tableLimit, setTableLimit] = useState(null);

  useEffect(() => {
    const fetchVenueAndData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data: venueData } = await supabase
        .from('venues')
        .select('id, table_count')
        .eq('email', userData.user.email)
        .single();

      if (!venueData) return;

      setVenueId(venueData.id);
      setTableLimit(venueData.table_count);

      await loadQuestionsMap(venueData.id);
      await fetchTablePositions(venueData.id);
      await fetchLatestFeedback(venueData.id);
      setLoading(false);
    };
    fetchVenueAndData();
  }, []);

  const loadQuestionsMap = async (venueId) => {
    const { data: questions } = await supabase
      .from('questions')
      .select('id, question')
      .eq('venue_id', venueId);

    const map = {};
    questions?.forEach(q => { map[q.id] = q.question });
    setQuestionsMap(map);
  };

  const fetchTablePositions = async (venueId) => {
    const { data } = await supabase
      .from('table_positions')
      .select('*')
      .eq('venue_id', venueId);

    const container = layoutRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const enriched = (data || []).map(t => ({
      ...t,
      x_px: (t.x_percent / 100) * width,
      y_px: (t.y_percent / 100) * height
    }));

    setPositions(enriched);
  };

  const fetchLatestFeedback = async (venueId) => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching feedback:', error);
      return;
    }

    const sessionMap = {}, unresolvedMap = {}, latestSessionPerTable = {};
    for (const entry of data) {
      const table = entry.table_number;
      if (!table) continue;
      if (!latestSessionPerTable[table]) {
        latestSessionPerTable[table] = entry.session_id;
        sessionMap[table] = [entry];
      } else if (entry.session_id === latestSessionPerTable[table]) {
        sessionMap[table].push(entry);
      }
    }

    for (const table in sessionMap) {
      const entries = sessionMap[table];
      const unresolved = entries.some(e => !e.is_actioned && e.rating <= 2);
      unresolvedMap[table] = unresolved;
    }

    setUnresolvedTables(unresolvedMap);
    setLatestSessions(sessionMap);
  };

  const handleDragStop = (e, data, table) => {
    setPositions(prev =>
      prev.map(t =>
        t.id === table.id
          ? {
              ...t,
              x_px: data.x,
              y_px: data.y
            }
          : t
      )
    );
  };

  const addTable = () => {
    const trimmed = newTableNumber.trim();
    if (!trimmed || positions.some(p => p.table_number === trimmed)) {
      alert('Table number must be unique.');
      return;
    }
    if (positions.length >= tableLimit) {
      alert('You’ve reached the maximum number of tables allowed.');
      return;
    }

    const container = layoutRef.current;
    const { width, height } = container.getBoundingClientRect();

    const id = `temp-${Date.now()}`;
    setPositions(prev => [
      ...prev,
      {
        id,
        venue_id: venueId,
        table_number: trimmed,
        x_px: width / 2 - 35,
        y_px: height / 2 - 35,
        shape: newShape
      }
    ]);
    setNewTableNumber('');
  };

  const removeTable = (id) => {
    const toDelete = positions.find(p => p.id === id);
    if (!toDelete) return;

    if (!id.startsWith('temp-')) {
      setDeletedIds(prev => [...prev, id]);
    }

    setPositions(prev => prev.filter(t => t.id !== id));
  };

  const clearAllTables = async () => {
    if (!venueId) return;
    const { data } = await supabase.from('table_positions').select('id').eq('venue_id', venueId);
    if (data?.length) {
      const ids = data.map(d => d.id);
      await supabase.from('table_positions').delete().in('id', ids);
    }
    setPositions([]);
    setDeletedIds([]);
    setConfirmClear(false);
  };

  const saveTables = async () => {
    setSaving(true);

    const container = layoutRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();

    const payload = positions
      .filter(t => !deletedIds.includes(t.id))
      .map(t => {
        const x_percent = (t.x_px / width) * 100;
        const y_percent = (t.y_px / height) * 100;
        return {
          id: t.id?.startsWith('temp-') ? uuidv4() : t.id,
          venue_id: venueId,
          table_number: t.table_number,
          x_percent,
          y_percent,
          shape: t.shape
        };
      });

    if (deletedIds.length) {
      await supabase.from('table_positions').delete().in('id', deletedIds);
    }

    const { error } = await supabase.from('table_positions').upsert(payload);
    if (!error) {
      await fetchLatestFeedback(venueId);
      await fetchTablePositions(venueId);
      setEditMode(false);
      setDeletedIds([]);
    } else {
      console.error('❌ Supabase save error:', error);
    }
    setSaving(false);
  };

  const handleTableClick = (tableNumber) => {
    setSelectedTable({
      number: tableNumber,
      entries: latestSessions[tableNumber] || []
    });
    setModalOpen(true);
  };

  const markAsResolved = async () => {
    const ids = selectedTable.entries.map(e => e.id);
    if (!ids.length) return;
    await supabase.from('feedback').update({ is_actioned: true }).in('id', ids);
    await fetchLatestFeedback(venueId);
    setModalOpen(false);
  };

  if (loading) return <p className="p-8 text-gray-600">Loading heatmap...</p>;

  return (
    <PageContainer>
      <TableEditorPanel
        editMode={editMode}
        newTableNumber={newTableNumber}
        setNewTableNumber={setNewTableNumber}
        newShape={newShape}
        setNewShape={setNewShape}
        onAddTable={addTable}
        onSave={saveTables}
        saving={saving}
        onClear={() => setConfirmClear(true)}
        onToggleEdit={() => setEditMode(!editMode)}
      />

      <div
        id="layout-area"
        ref={layoutRef}
        className="relative w-full h-[600px] bg-white border rounded"
      >
        {positions.map((table) => (
          <TableNode
            key={table.id}
            table={table}
            editMode={editMode}
            unresolved={unresolvedTables[table.table_number]}
            onDragStop={handleDragStop}
            onRemove={removeTable}
            onClick={handleTableClick}
          />
        ))}
      </div>

      <TableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedTable={selectedTable}
        questionsMap={questionsMap}
        onResolve={markAsResolved}
      />

      <Modal
        isOpen={confirmClear}
        onRequestClose={() => setConfirmClear(false)}
        ariaHideApp={false}
        className="bg-white p-6 rounded-lg max-w-sm mx-auto shadow-xl border"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-lg font-bold mb-4">Clear All Tables?</h2>
        <p className="mb-4 text-gray-600">This will permanently remove all tables from your layout.</p>
        <div className="flex justify-end gap-4">
          <button onClick={() => setConfirmClear(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Cancel</button>
          <button onClick={clearAllTables} className="bg-red-600 text-white px-4 py-2 rounded">Confirm</button>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Heatmap;