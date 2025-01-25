import React from 'react';
import { ArrowRight } from 'lucide-react';

const CallToActionSection = ({ openDemoModal }) => {
  return (
    <section>
      {/* Container */}
      <div className="px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-7xl bg-gray-100 px-4 py-32 text-center">
          {/* Title */}
          <h2 className="mx-auto mb-6 max-w-3xl flex-col text-3xl font-bold md:mb-10 md:text-5xl lg:mb-12">
            Ready to get started?
          </h2>
          <ul className="mx-auto mb-8 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8 md:gap-10 lg:mb-12">
            <li className="flex items-center">
              <img
                src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9473e2e6cf65_tick-circle.svg"
                alt=""
                className="mr-2 h-8 w-8"
              />
              <p className="text-sm sm:text-base">Easy Setup</p>
            </li>
            <li className="flex items-center">
              <img
                src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9473e2e6cf65_tick-circle.svg"
                alt=""
                className="mr-2 h-8 w-8"
              />
              <p className="text-sm sm:text-base">No Hardware</p>
            </li>
          </ul>
          {/* Button with Pointer Cursor */}
          <a
            onClick={openDemoModal}
            className="mb-4 inline-block cursor-pointer items-center bg-black px-6 py-3 text-center font-semibold text-white hover:bg-gray-800"
          >
            Get Started and book a demo!
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;