import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import Navbar from './Navbar'; // Import the Navbar component
import Footer from './Footer'; // Import the Footer component

const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track form submission

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      // Send form data to FormSubmit
      const response = await fetch('https://formsubmit.co/luke@getchatters.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true); // Hide the form and show the thank-you message
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50 relative overflow-hidden">
      {/* Use the Navbar component */}
      <Navbar />

      {/* Contact Section */}
      <div className="relative pt-32 pb-16 sm:pt-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 space-y-3 tracking-tight">
              <span className="block">Get in Touch</span>
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to reach out.
            </p>
          </div>

          {/* Contact Form and Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form Container */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              {isSubmitted ? (
                // Thank-You Message
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Thank You!</h2>
                  <p className="text-lg text-gray-600">
                    Your message has been sent successfully. We'll respond within 24 hours.
                  </p>
                </div>
              ) : (
                // Contact Form
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* First Name */}
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Your first name"
                        required
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Your last name"
                        required
                      />
                    </div>

                    {/* Business Name */}
                    <div>
                      <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                        Business Name
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Your business name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Your message..."
                        required
                      ></textarea>
                    </div>

                    {/* Hidden Fields for FormSubmit */}
                    <input type="hidden" name="_captcha" value="false" /> {/* Disable CAPTCHA */}
                    <input
                      type="hidden"
                      name="_next"
                      value="https://yourwebsite.com/thank-you" // Replace with your thank-you page URL
                    />

                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Send Message
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email us at</p>
                    <p className="text-lg font-medium text-gray-900">luke@getchatters.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Call us at</p>
                    <p className="text-lg font-medium text-gray-900">+44 7932 065 904</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use the Footer component */}
      <Footer />
    </div>
  );
};

export default ContactPage;