import React from 'react';
import { ArrowRight } from 'lucide-react';

const CallToActionSection = ({ openDemoModal }) => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Delight More Guests?</h2>
          <p className="text-gray-200 max-w-2xl mx-auto mb-8">
            Join other hospitality teams who are using Chatters to prevent issues and maintain service excellence.
          </p>
          <button
            onClick={openDemoModal}
            className="px-8 py-3 text-base font-medium rounded-xl text-green-600 bg-white hover:bg-gray-50 transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>Book your demo</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;