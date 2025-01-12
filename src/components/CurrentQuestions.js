import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';

const CurrentQuestions = ({ questions, onEdit, onDelete, onDragEnd }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900">Current Questions</h2>
      <p className="text-sm text-gray-400 mb-4">
        You can drag and drop these questions in the order your customers will answer them.
        Your NPS Question will automatically be populated, no need to add it here.
      </p>
      <Droppable droppableId="questions">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {questions.map((q, index) => (
              <Draggable key={q.id} draggableId={q.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-gray-700 text-lg">{q.question}</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => onEdit(q.id, q.question)}
                          className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(q.id)}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default CurrentQuestions;