import React from 'react';
import { Globe, MessageSquare, Check } from 'lucide-react';

const HowItWorksSection = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Turn feedback into instant action in three simple steps
          </p>
        </div>
        
        {/* Timeline Steps */}
        <div className="flex flex-col md:flex-row justify-between items-start mt-12 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-green-200 z-0"></div>
          
          {/* Steps */}
          {[
            {
              icon: Globe,
              title: "Guest Scans QR",
              desc: "Strategically placed QR codes make it easy for guests to share feedback"
            },
            {
              icon: MessageSquare,
              title: "Instant Alert",
              desc: "Your team gets notified immediately when attention is needed"
            },
            {
              icon: Check,
              title: "Swift Resolution",
              desc: "Address concerns before they become negative reviews"
            }
          ].map((step, i) => (
            <div key={i} className="flex-1 relative z-10 px-4 mb-8 md:mb-0">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;