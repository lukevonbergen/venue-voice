import React from 'react';

const HeroSection = () => {
  return (
    <header>
      {/* Hero Container */}
      <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-20">
        {/* Component */}
        <div className="grid items-center justify-items-start gap-8 sm:gap-20 lg:grid-cols-2">
          {/* Hero Content */}
          <div className="flex flex-col">
            {/* Hero Title */}
            <h1 className="mb-4 text-4xl font-bold md:text-6xl">
              Eliminate negative reviews before they're made
            </h1>
            <p className="mb-6 max-w-lg text-sm text-gray-500 sm:text-xl md:mb-10 lg:mb-12">
              Get instant notifications when guests need attention. Resolve concerns before they escalate into complaints.
            </p>
            {/* Hero Button */}
            <div className="flex items-center">
              <a
                href="/demo"
                className="mr-5 items-center rounded-md bg-black px-6 py-3 font-semibold text-white md:mr-6 lg:mr-8"
              >
                Demo
              </a>
              <a href="/pricing" className="group flex max-w-full items-center font-bold relative">
                {/* First Arrow (slides out) */}
                <img
                  src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a94bd85e6cf98_ArrowUpRight%20(4).svg"
                  alt=""
                  className="mr-2 inline-block max-h-4 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-0"
                />
                {/* Second Arrow (slides in) */}
                <img
                  src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a94bd85e6cf98_ArrowUpRight%20(4).svg"
                  alt=""
                  className="absolute mr-2 inline-block max-h-4 w-5 transition-transform duration-300 opacity-0 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
                  style={{ bottom: '-10px', right: '-10px' }}
                />
                <p>Pricing</p>
              </a>
            </div>
          </div>
          {/* Hero Image */}
          <img
            src="/img/Chatters_LP_Image.png"
            alt=""
            className="inline-block h-full w-full max-w-2xl"
          />
        </div>
      </div>
    </header>
  );
};

export default HeroSection;