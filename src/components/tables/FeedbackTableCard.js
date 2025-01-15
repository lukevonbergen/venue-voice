import React, { useState } from 'react';

const FeedbackTableCard = ({ feedback, onMarkAsActioned, onMoveBackToUnactioned }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Table {feedback.table_number}</h3>
          <p className="text-sm text-gray-500">
            {new Date(feedback.timestamp).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4">
          {feedback.questions.map((question, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold">{question.question}</p>
              <p className="text-sm text-gray-600">Rating: {question.rating}</p>
              <p className="text-sm text-gray-600">Answer: {question.answer}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        {feedback.is_actioned ? (
          <button
            onClick={() => onMoveBackToUnactioned(feedback.id)}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Move back to unactioned
          </button>
        ) : (
          <button
            onClick={() => onMarkAsActioned(feedback.id)}
            className="text-sm text-green-500 hover:text-green-700"
          >
            Mark as actioned
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedbackTableCard;