import React from 'react';
import { Plus } from 'lucide-react';

const PreviouslyUsedQuestions = ({ inactiveQuestions, searchTerm, onSearchChange, onAddInactiveQuestion }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Previously Used Questions</h2>
      <input
        type="text"
        placeholder="Search previously used questions..."
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {inactiveQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-500 transition-colors duration-200"
            onClick={() => onAddInactiveQuestion(q)}
          >
            <div className="flex justify-between items-center">
              <p className="text-gray-700">{q.question}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddInactiveQuestion(q);
                }}
                className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <Plus className="w-5 h-5 text-blue-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviouslyUsedQuestions;