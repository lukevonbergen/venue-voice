import React from 'react';
import { Bell, BarChart2, Users, Star } from 'lucide-react';

const featureImages = [
  "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "/img/lp-img-vv.png",
  "https://images.pexels.com/photos/7016364/pexels-photo-7016364.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
];

const FeaturesSection = () => {
  return (
    <section>
    {/* Container */}
    <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-20">
      {/* Component */}
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
        {/* Image */}
        <div className="h-full w-full">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2FPlaceholder%20Image.svg?alt=media&token=375a1ea3-a8b6-4d63-b975-aac8d0174074"
            alt=""
            className="mx-auto inline-block h-full w-full max-w-2xl object-cover"
          />
        </div>
        {/* List */}
        <ul className="grid max-w-2xl grid-cols-2 sm:gap-5 lg:max-w-none">
          <li className="flex flex-col p-5">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2FPlaceholder%20Image.svg?alt=media&token=375a1ea3-a8b6-4d63-b975-aac8d0174074"
              alt=""
              className="mb-4 object-cover inline-block h-10 w-10 rounded-full "
            />
            <p className="mb-4 font-semibold">QR codes</p>
            <p className="text-sm text-gray-500">
              Easy-to-use QR codes for guests to scan and leave feedback.
            </p>
          </li>
          <li className="flex flex-col p-5">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2FPlaceholder%20Image.svg?alt=media&token=375a1ea3-a8b6-4d63-b975-aac8d0174074"
              alt=""
              className="mb-4 object-cover inline-block h-10 w-10 rounded-full "
            />
            <p className="mb-4 font-semibold">Real-time Stats</p>
            <p className="text-sm text-gray-500">
              Real-time statistics to help you make data-driven decisions.
            </p>
          </li>
          <li className="flex flex-col p-5">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2FPlaceholder%20Image.svg?alt=media&token=375a1ea3-a8b6-4d63-b975-aac8d0174074"
              alt=""
              className="mb-4 object-cover inline-block h-10 w-10 rounded-full "
            />
            <p className="mb-4 font-semibold">Custom Questions</p>
            <p className="text-sm text-gray-500">
              Custom questions for you to ask your guests.
            </p>
          </li>
          <li className="flex flex-col p-5">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2FPlaceholder%20Image.svg?alt=media&token=375a1ea3-a8b6-4d63-b975-aac8d0174074"
              alt=""
              className="mb-4 object-cover inline-block h-10 w-10 rounded-full "
            />
            <p className="mb-4 font-semibold">NPS Score</p>
            <p className="text-sm text-gray-500">
              Track and monitor your Net Promoter Score.
            </p>
          </li>
          <li className="flex flex-col p-5">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2FPlaceholder%20Image.svg?alt=media&token=375a1ea3-a8b6-4d63-b975-aac8d0174074"
              alt=""
              className="mb-4 object-cover inline-block h-10 w-10 rounded-full "
            />
            <p className="mb-4 font-semibold">Branding</p>
            <p className="text-sm text-gray-500">
              Custom Branding to match your business.
            </p>
          </li>
          <li className="flex flex-col p-5">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/flowspark-1f3e0.appspot.com/o/Tailspark%20Images%2FPlaceholder%20Image.svg?alt=media&token=375a1ea3-a8b6-4d63-b975-aac8d0174074"
              alt=""
              className="mb-4 object-cover inline-block h-10 w-10 rounded-full "
            />
            <p className="mb-4 font-semibold">Dashboards</p>
            <p className="text-sm text-gray-500">
              A birds eye view of your feedback, at a glance.
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
  );
};

export default FeaturesSection;