import React from "react";
import { useNavigate } from "react-router-dom";

const PopularGames = () => {
  const navigate = useNavigate();

  const handleGameClick = (category) => {
    navigate("/games", { state: { category } });
  };

  return (
    <section className="text-center my-2">
      <h2 className="text-xl font-bold mb-4">GAMES CATEGORY</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 sm:px-8">
        {[
          { name: "SLOT", img: "games/slot.jpg" },
          { name: "LIVE CASINO", img: "games/live_casino.jpg" },
          { name: "SHAN KOE MEE", img: "games/shan.jpg" },
          { name: "VICTORY ARK", img: "games/va.jpg" },
        ].map((game) => (
          <div
            key={game.name}
            onClick={() => handleGameClick(game.name)}
            className="bg-gray-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1"
            role="button"
            aria-label={`Open ${game.name}`}
          >
            <img
              src={game.img}
              alt={game.name}
              className="w-80 h-80 object-cover rounded mx-auto mb-4"
            />
            <p className="text-lg font-semibold">{game.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularGames;
