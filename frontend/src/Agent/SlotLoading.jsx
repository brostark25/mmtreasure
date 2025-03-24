import React, { useState, useEffect } from "react";

const symbols = ["🍒", "🍒", "🍋", "🍋", "🍉", "⭐", "🔔", "🍇"]; // More common symbols for higher win probability

const SlotLoading = () => {
  const [slots, setSlots] = useState(
    Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 0))
  );
  const [spinning, setSpinning] = useState(false);
  const [score, setScore] = useState(0);
  const [win, setWin] = useState(false);
  const [exploding, setExploding] = useState(false);

  useEffect(() => {
    if (spinning) {
      const interval = setInterval(() => {
        setSlots(
          slots.map((row) =>
            row.map(() => Math.floor(Math.random() * symbols.length))
          )
        );
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        setSpinning(false);
        checkWin();
      }, 2000);
    }
  }, [spinning]);

  const checkWin = () => {
    let hasWin = false;
    slots.forEach((row) => {
      if (row.every((symbol) => symbol === row[0])) {
        hasWin = true;
      }
    });
    if (hasWin) {
      setWin(true);
      setScore((prevScore) => prevScore + 10);
      setExploding(true);
      setTimeout(() => setExploding(false), 1000);
    } else {
      setWin(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-transparent text-white p-4">
      {/* Win Message */}
      {win && (
        <div className="mt-4 text-2xl sm:text-3xl text-green-500 animate-bounce">
          You Win! 🎉
        </div>
      )}
      {/* Slot Reels */}
      <div className="grid grid-cols-3 gap-2">
        {slots.map((row, rowIndex) =>
          row.map((slot, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`text-4xl sm:text-6xl bg-transparent p-4 sm:p-8 rounded-lg shadow-lg transition-all duration-300 ${
                win && exploding
                  ? "animate-ping bg-red-500"
                  : win
                  ? "bg-green-500"
                  : ""
              }`}
            >
              {symbols[slot]}
            </div>
          ))
        )}
      </div>

      {/* Spin Button */}
      <button
        onClick={() => {
          setSpinning(true);
          setWin(false);
        }}
        disabled={spinning}
        className={`mt-6 sm:mt-8 px-4 sm:px-6 py-2 sm:py-3 text-lg sm:text-xl rounded-lg ${
          spinning ? "bg-gray-500" : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {spinning ? "Spinning..." : "Spin"}
      </button>

      {/* Score Display */}
      <div className="mt-4 text-xl sm:text-2xl text-blue-500">
        Score: <span className="font-bold">{score}</span>
      </div>
    </div>
  );
};

export default SlotLoading;
