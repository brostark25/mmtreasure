// ComingSoon.jsx
import React from "react";

const ComingSoon = ({ title }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-white p-5">
      <div className="text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 animate-bounce tracking-wide">
          {title}
        </h1>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-300 mt-4 mb-8">
          Comming Soon
        </h1>
        <p className="text-lg sm:text-2xl mb-8 text-gray-300 max-w-lg mx-auto">
          We're working hard to launch something amazing. Stay tuned!
        </p>

        <div className="flex justify-center items-center space-x-4 mb-8">
          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 rounded-lg text-gray-900 focus:outline-none w-64"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold transition duration-200 ease-in-out">
            Notify Me
          </button>
        </div>

        <div className="flex justify-center items-center space-x-6 mt-6 text-gray-500">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="./social/fb_icon.png"
              alt="Facebook"
              className="w-8 h-8 hover:text-white transition-transform transform hover:scale-110"
            />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="./social/twitter_icon.png"
              alt="Twitter"
              className="w-8 h-8 hover:text-white transition-transform transform hover:scale-110"
            />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="./social/ig_icon.png"
              alt="Instagram"
              className="w-8 h-8 hover:text-white transition-transform transform hover:scale-110"
            />
          </a>
        </div>
      </div>

      <footer className="mt-12 text-gray-500 text-sm">
        © 2024 YourCompany. All rights reserved.
      </footer>
    </div>
  );
};

export default ComingSoon;
