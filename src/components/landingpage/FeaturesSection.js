import React from 'react';
import { Bell, BarChart2, Users, Star } from 'lucide-react';

const featureImages = [
  "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "/img/lp-img-vv.png",
  "https://images.pexels.com/photos/7016364/pexels-photo-7016364.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
];

const FeaturesSection = () => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powerful features designed specifically for hospitality teams
          </p>
        </div>

        {/* Zigzag Features */}
        {[
          {
            title: "Real-time Issue Alerts",
            desc: "Get instant notifications when guests need attention. Resolve concerns before they escalate into complaints.",
            stats: "73% of potential negative reviews prevented",
            icon: Bell
          },
          {
            title: "Smart Performance Analytics",
            desc: "Track service quality trends and identify improvement opportunities with intuitive dashboards.",
            stats: "89% improvement in response time",
            icon: BarChart2
          },
          {
            title: "Team Insights & Feedback Alignment",
            desc: "Stay informed and aligned with real-time customer feedback and NPS scores. Empower your team to address concerns and improve guest satisfaction collaboratively.",
            stats: "54% reduction in service delays",
            icon: Users
          }
        ].map((feature, i) => (
          <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-24`}>
            {/* Feature Content */}
            <div className="flex-1 p-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-50">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-lg mb-4">{feature.desc}</p>
              <div className="inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                <Star className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium">{feature.stats}</span>
              </div>
            </div>
            
            {/* Feature Image/Demo */}
            <div className="flex-1 p-8">
              <img src={featureImages[i]} alt={feature.title} className="rounded-2xl aspect-video object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;