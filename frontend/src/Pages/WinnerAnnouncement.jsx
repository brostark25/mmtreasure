import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const WinnerAnnouncement = ({ userData }) => {
  const [winners, setWinners] = useState([]);

  // Fetch winners data
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/winners");
        if (response.status === 200) {
          setWinners(response.data);
        }
      } catch (error) {
        console.error("Error fetching winners:", error);
      }
    };
    fetchWinners();
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="bg-[#2e4475] text-white p-4 rounded-lg my-6 overflow-hidden"
    >
      <h2 className="text-lg font-bold text-center pb-4">🎉 Big Wins 🎉</h2>
      <div className="marquee">
        <div className="marquee-inner">
          <div className="winner-card bg-[#3b4b68] rounded-lg p-2 md:p-4 shadow-md flex flex-col md:flex-row items-center gap-2 md:gap-4 mx-2 md:mx-4">
            {/* Game Icon */}
            <img
              src="games/g1.jpg"
              alt="Game 1"
              className="w-24 h-12 md:w-36 md:h-16 rounded-md border-2 border-yellow-500"
            />

            {/* Winner Details */}
            <div className="text-center md:text-left">
              <h3 className="text-yellow-400 font-bold text-xs md:text-sm">
                B112345
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">
                Won: <span className="text-yellow-300 font-bold">10000</span>
              </p>
              <p className="text-gray-400 text-xs italic">Slot</p>
            </div>
          </div>

          <div className="winner-card bg-[#3b4b68] rounded-lg p-2 md:p-4 shadow-md flex flex-col md:flex-row items-center gap-2 md:gap-4 mx-2 md:mx-4">
            {/* Game Icon */}
            <img
              src="games/g1.jpg"
              alt="Game 1"
              className="w-24 h-12 md:w-36 md:h-16 rounded-md border-2 border-yellow-500"
            />

            {/* Winner Details */}
            <div className="text-center md:text-left">
              <h3 className="text-yellow-400 font-bold text-xs md:text-sm">
                B112345
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">
                Won: <span className="text-yellow-300 font-bold">10000</span>
              </p>
              <p className="text-gray-400 text-xs italic">Slot</p>
            </div>
          </div>

          <div className="winner-card bg-[#3b4b68] rounded-lg p-2 md:p-4 shadow-md flex flex-col md:flex-row items-center gap-2 md:gap-4 mx-2 md:mx-4">
            {/* Game Icon */}
            <img
              src="games/g1.jpg"
              alt="Game 1"
              className="w-24 h-12 md:w-36 md:h-16 rounded-md border-2 border-yellow-500"
            />

            {/* Winner Details */}
            <div className="text-center md:text-left">
              <h3 className="text-yellow-400 font-bold text-xs md:text-sm">
                B112345
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">
                Won: <span className="text-yellow-300 font-bold">10000</span>
              </p>
              <p className="text-gray-400 text-xs italic">Slot</p>
            </div>
          </div>

          <div className="winner-card bg-[#3b4b68] rounded-lg p-2 md:p-4 shadow-md flex flex-col md:flex-row items-center gap-2 md:gap-4 mx-2 md:mx-4">
            {/* Game Icon */}
            <img
              src="games/g1.jpg"
              alt="Game 1"
              className="w-24 h-12 md:w-36 md:h-16 rounded-md border-2 border-yellow-500"
            />

            {/* Winner Details */}
            <div className="text-center md:text-left">
              <h3 className="text-yellow-400 font-bold text-xs md:text-sm">
                B112345
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">
                Won: <span className="text-yellow-300 font-bold">10000</span>
              </p>
              <p className="text-gray-400 text-xs italic">Slot</p>
            </div>
          </div>

          <div className="winner-card bg-[#3b4b68] rounded-lg p-2 md:p-4 shadow-md flex flex-col md:flex-row items-center gap-2 md:gap-4 mx-2 md:mx-4">
            {/* Game Icon */}
            <img
              src="games/g1.jpg"
              alt="Game 1"
              className="w-24 h-12 md:w-36 md:h-16 rounded-md border-2 border-yellow-500"
            />

            {/* Winner Details */}
            <div className="text-center md:text-left">
              <h3 className="text-yellow-400 font-bold text-xs md:text-sm">
                B112345
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">
                Won: <span className="text-yellow-300 font-bold">10000</span>
              </p>
              <p className="text-gray-400 text-xs italic">Slot</p>
            </div>
          </div>

          <div className="winner-card bg-[#3b4b68] rounded-lg p-2 md:p-4 shadow-md flex flex-col md:flex-row items-center gap-2 md:gap-4 mx-2 md:mx-4">
            {/* Game Icon */}
            <img
              src="games/g1.jpg"
              alt="Game 1"
              className="w-24 h-12 md:w-36 md:h-16 rounded-md border-2 border-yellow-500"
            />

            {/* Winner Details */}
            <div className="text-center md:text-left">
              <h3 className="text-yellow-400 font-bold text-xs md:text-sm">
                B112345
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">
                Won: <span className="text-yellow-300 font-bold">10000</span>
              </p>
              <p className="text-gray-400 text-xs italic">Slot</p>
            </div>
          </div>

          <div className="winner-card bg-[#3b4b68] rounded-lg p-2 md:p-4 shadow-md flex flex-col md:flex-row items-center gap-2 md:gap-4 mx-2 md:mx-4">
            {/* Game Icon */}
            <img
              src="games/g1.jpg"
              alt="Game 1"
              className="w-24 h-12 md:w-36 md:h-16 rounded-md border-2 border-yellow-500"
            />

            {/* Winner Details */}
            <div className="text-center md:text-left">
              <h3 className="text-yellow-400 font-bold text-xs md:text-sm">
                B112345
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">
                Won: <span className="text-yellow-300 font-bold">10000</span>
              </p>
              <p className="text-gray-400 text-xs italic">Slot</p>
            </div>
          </div>

          <div className="winner-card bg-[#3b4b68] rounded-lg p-2 md:p-4 shadow-md flex flex-col md:flex-row items-center gap-2 md:gap-4 mx-2 md:mx-4">
            {/* Game Icon */}
            <img
              src="games/g1.jpg"
              alt="Game 1"
              className="w-24 h-12 md:w-36 md:h-16 rounded-md border-2 border-yellow-500"
            />

            {/* Winner Details */}
            <div className="text-center md:text-left">
              <h3 className="text-yellow-400 font-bold text-xs md:text-sm">
                B112345
              </h3>
              <p className="text-gray-300 text-xs md:text-sm">
                Won: <span className="text-yellow-300 font-bold">10000</span>
              </p>
              <p className="text-gray-400 text-xs italic">Slot</p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default WinnerAnnouncement;
