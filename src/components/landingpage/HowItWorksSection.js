import React from 'react';
import { Globe, MessageSquare, Check } from 'lucide-react';

const HowItWorksSection = () => {
  return (
    <section>
      {/* Container */}
      <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-20">
        {/* Title */}
        <h2 className="text-center text-3xl font-bold md:text-5xl">
          How it works
        </h2>
        <p className="mx-auto mb-8 mt-4 max-w-3xl text-center text-sm text-gray-500 sm:text-base md:mb-12 lg:mb-16">
          How does using Chatters help you meet your KPI's? Here's a step-by-step guide.
        </p>
        {/* Content */}
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* List */}
          <div className="flex h-full flex-col [grid-area:2/1/3/2] lg:[grid-area:1/2/2/3]">
            {/* Item */}
            <a
              className="mb-8 flex max-w-lg justify-center gap-4 rounded-xl border-b border-solid border-gray-300 px-6 py-5 text-black"
              href="#w-tabs-0-data-w-pane-0"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gray-100">
                <p className="text-sm font-bold sm:text-base">1</p>
              </div>
              <div className="ml-4 flex flex-col gap-2">
                <h5 className="text-xl font-bold">
                  Guests scan a QR code
                </h5>
                <p className="text-sm text-gray-500">
                  Your guests scan a QR code, allowing them to leave real-time feedback, while they're at the table.
                </p>
              </div>
            </a>
            {/* Item */}
            <a
              className="mb-8 flex max-w-lg justify-center gap-4 px-6 py-5 border-b border-solid border-gray-300 text-black"
              href="#w-tabs-0-data-w-pane-1"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gray-100">
                <p className="text-sm font-bold sm:text-base">2</p>
              </div>
              <div className="ml-4 flex flex-col gap-2">
                <h5 className="text-xl font-bold">Real-time data</h5>
                <p className="text-sm text-gray-500">
                  Once a guest has left feedback, you'll receive a notification in real-time, allowing you to act quickly.
                </p>
              </div>
            </a>
            {/* Item */}
            <a
              className="mb-8 flex max-w-lg justify-center gap-4 px-6 py-5 border-b border-solid border-gray-300 text-black"
              href="#w-tabs-0-data-w-pane-2"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gray-100">
                <p className="text-sm font-bold sm:text-base">3</p>
              </div>
              <div className="ml-4 flex flex-col gap-2">
                <h5 className="text-xl font-bold">Actioning Feedback</h5>
                <p className="text-sm text-gray-500">
                 Use the feedback to improve your service, and prevent negative reviews from being made.
                </p>
              </div>
            </a>
            {/* Item */}
            <a
              className="mb-8 flex max-w-lg justify-center gap-4 px-6 py-5 text-black"
              href="#w-tabs-0-data-w-pane-2"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gray-100">
                <p className="text-sm font-bold sm:text-base">4</p>
              </div>
              <div className="ml-4 flex flex-col gap-2">
                <h5 className="text-xl font-bold">View your NPS Score</h5>
                <p className="text-sm text-gray-500">
                  You can view your NPS Score, and see how your service is improving over time.
                </p>
              </div>
            </a>
          </div>
          {/* Image */}
          <img
            alt=""
            src="https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2FPlaceholder%20Image.svg?alt=media&token=375a1ea3-a8b6-4d63-b975-aac8d0174074"
            className="block h-full w-full overflow-hidden [grid-area:1/1/2/2] lg:[grid-area:1/1/2/2]"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;