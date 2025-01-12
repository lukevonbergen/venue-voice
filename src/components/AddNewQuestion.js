import React from 'react';

const AddNewQuestion = ({ newQuestion, onQuestionChange, onAddQuestion, questions, duplicateError }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Question</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter a new question"
            value={newQuestion}
            onChange={onQuestionChange}
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            maxLength={100}
          />
          <button
            onClick={onAddQuestion}
            className={`${
              questions.length >= 5
                ? 'bg-gray-500 hover:bg-gray-600'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white px-6 py-3 rounded-lg transition-colors duration-200`}
          >
            {questions.length >= 5 ? 'Replace...' : 'Add Question'}
          </button>
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-sm text-gray-500">{newQuestion.length}/100 characters</p>
          {duplicateError && <p className="text-sm text-red-500">{duplicateError}</p>}
          {questions.length >= 5 && (
            <p className="text-sm text-red-500">Maximum questions limit reached (5/5)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddNewQuestion;