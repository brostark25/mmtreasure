// src/components/ComingSoon.jsx
import { useState, useEffect } from "react";
import { FiClock, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";

const ComingSoon = ({
  pageName,
  launchDate,
  contactEmail,
  contactPhone,
  location,
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  function calculateTimeLeft() {
    const difference = new Date(launchDate) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    if (!timeLeft[interval]) return null;

    return (
      <div key={interval} className="flex flex-col items-center mx-2">
        <motion.div
          className="text-4xl font-bold bg-white/10 backdrop-blur-sm rounded-lg p-4 w-20 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {timeLeft[interval]}
        </motion.div>
        <span className="text-sm mt-2 uppercase">{interval}</span>
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full"
      >
        <div className="mb-8">
          <FiClock className="mx-auto text-5xl mb-4 text-yellow-300" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {pageName} Coming Soon!
          </h1>
          <p className="text-xl opacity-90 mb-8">
            We're working hard to bring you an amazing experience. Stay tuned!
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="flex justify-center mb-12">
          {timerComponents.length ? (
            <div className="flex">{timerComponents}</div>
          ) : (
            <div className="text-2xl">We're live! 🎉</div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Get Notified</h2>
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <FiMail className="mr-3 text-yellow-300" />
              <a href={`mailto:${contactEmail}`} className="hover:underline">
                {contactEmail}
              </a>
            </div>
            <div className="flex items-center">
              <FiPhone className="mr-3 text-yellow-300" />
              <a href={`tel:${contactPhone}`} className="hover:underline">
                {contactPhone}
              </a>
            </div>
            <div className="flex items-center">
              <FiMapPin className="mr-3 text-yellow-300" />
              <span>{location}</span>
            </div>
          </div>

          {/* Email Signup Form */}
          <form className="mt-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold rounded-lg transition-colors"
              >
                Notify Me
              </button>
            </div>
          </form>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mt-8">
          {["Twitter", "Facebook", "Instagram", "LinkedIn"].map((social) => (
            <motion.a
              key={social}
              href="#"
              className="hover:text-yellow-300"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {social}
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
