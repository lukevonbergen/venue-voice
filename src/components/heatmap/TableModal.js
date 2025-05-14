import React from 'react';
import Modal from 'react-modal';

const TableModal = ({ isOpen, onClose, selectedTable, questionsMap, onResolve }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20 shadow-xl border"
      overlayClassName="fixed inset-0 bg-transparent flex items-center justify-center"
    >
      <h2 className="text-xl font-bold mb-4">Table {selectedTable?.number} Feedback</h2>
      <div className="space-y-3 mb-4">
        {selectedTable?.entries.map((entry, i) => (
          <div key={i} className="text-sm border-b pb-2">
            <div><strong>Question:</strong> {questionsMap[entry.question_id] || 'N/A'}</div>
            <div><strong>Sentiment:</strong> {entry.sentiment || 'N/A'} (Rating: {entry.rating ?? 'N/A'})</div>
            {entry.additional_feedback && (
              <div><strong>Note:</strong> {entry.additional_feedback}</div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onResolve}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Mark as Resolved
      </button>
    </Modal>
  );
};

export default TableModal;