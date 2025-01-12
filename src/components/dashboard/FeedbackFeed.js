import React from 'react';

const FeedbackFeed = ({ feedback }) => {
  // Filter out feedback without additional_feedback
  const filteredFeedback = feedback.filter((f) => f.additional_feedback);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Live Feedback Feed</h2>
      <div className="space-y-4">
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map((f, index) => (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-center justify-between">
                <p className="text-gray-700">{f.additional_feedback}</p>
                <span className="text-sm text-gray-400">
                  {new Date(f.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No feedback with comments in the selected time frame.</p>
        )}
      </div>
    </div>
  );
};

export default FeedbackFeed;