import React from 'react';
import { X } from 'lucide-react';

const DemoModal = ({ isDemoModalOpen, closeDemoModal }) => {
  if (!isDemoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl relative">
        <button
          onClick={closeDemoModal}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>
        <div className="p-8">
          <div
            className="meetings-iframe-container"
            data-src="https://meetings.hubspot.com/luke-von-bergen/chatters-demo?embed=true"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DemoModal;