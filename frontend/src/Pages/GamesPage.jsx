import React, { useEffect, useState } from "react";
import MainLayout from "../Layout/MainLayout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GamesPage = () => {
  // Step 1: Set initial state for selected category and games
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [games, setGames] = useState([]);
  const [hotGames, setHotGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Base URL for game images
  const gameImageBaseUrl = "https://common-static.ppgames.net/game_pic";

  // Check if the user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Fetch games data from backend API based on selected category
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);

        // Fetch hot games data
        const hotGamesResponse = await axios.post(
          `${
            import.meta.env.VITE_API_URL
          }/api/p2provider/pragmatic/casinolobbygames`
        );
        setHotGames(hotGamesResponse.data.games?.hot || []);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching games:", error);
        setLoading(false);
      }
    };

    fetchGames();
  }, [selectedCategory]);

  // Sample games data
  const games = [
    { id: 1, name: "SLOT", category: "Slot", image: "games/slot.jpg" },
    {
      id: 2,
      name: "LIVE CASINO",
      category: "Live Casino",
      image: "games/live_casino.jpg",
    },
    {
      id: 3,
      name: "SHAN KOE MEE",
      category: "Casino",
      image: "games/shan.jpg",
    },
    // { id: 4, name: "SLOT", category: "Slot", image: "games/slot.jpg" },
    {
      id: 4,
      name: "VICTORY ARK",
      category: "Victory Ark",
      image: "games/va.jpg",
    },
  ];

  // Step 2: Filter games based on selected category
  const filteredGames =
    selectedCategory === "All"
      ? games
      : games.filter((game) => game.category === selectedCategory);

  // Step 2: Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleGameClick = (e, gameName) => {
    if (!isLoggedIn) {
      e.preventDefault();
      alert("Please log in to enter the game.");
    } else {
      alert(`You entered the game: ${gameName}`);
    }
  };

  if (loading) {
    return <div>Loading games...</div>;
  }

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-white p-5">
        {/* Popular Games of the Week */}
        <section className="text-center my-2">
          <h2 className="text-xl font-bold mb-4">POPULAR GAMES OF THE WEEK</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-8">
            {Array.isArray(hotGames) &&
              hotGames.slice(0, 3).map((game, index) => (
                <a
                  key={game.gameID || `game-${index}`}
                  href={isLoggedIn ? "#" : undefined}
                  onClick={(e) => handleGameClick(e, game.gameName)}
                >
                  <div className="bg-gray-700 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                    {/* Construct the image URL using the gameID */}
                    <img
                      src={`${gameImageBaseUrl}/rec/325/${game.gameID}.png`}
                      alt={game.gameName}
                      className="w-full h-auto object-cover rounded"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150"; // Fallback image
                      }}
                    />
                    <p className="p-5 font-normal text-lg text-center">
                      {game.gameName}
                    </p>
                  </div>
                </a>
              ))}
          </div>
        </section>

        {/* Category Filter */}
        <section className="text-white p-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center justify-center sm:justify-start">
            <span className="text-lg sm:text-xl font-bold mb-4 sm:mb-0 text-center sm:text-left">
              SELECT BY GAMES CATEGORY
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <span className="font-bold">
              <select
                className="py-2 px-4 w-full sm:w-60 md:w-72 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 shadow-sm transition-colors"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="All">ALL</option>
                <option value="Slot">Slot</option>
                <option value="Casino">Casino</option>
                <option value="Live Casino">Live Casino</option>
                <option value="Victory Ark">Victory Ark</option>
              </select>
            </span>
          </div>
        </section>

        {/* Display filtered games based on selected category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 p-4">
          {games.length > 0 ? (
            games.map((game) => (
              <a
                key={game.gameID}
                href={isLoggedIn ? "#" : undefined}
                onClick={(e) => handleGameClick(e, game.gameName)}
              >
                <div className="bg-gray-700 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  {/* Construct the image URL using the gameID */}
                  <img
                    src={`${gameImageBaseUrl}/rec/325/${game.gameID}.png`}
                    alt={game.gameName}
                    className="m-auto object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150"; // Fallback image
                    }}
                  />
                  <p className="font-semibold text-lg text-center">
                    {game.gameName}
                  </p>
                </div>
              </a>
            ))
          ) : (
            <p className="text-center text-white">
              No games available in this category.
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default GamesPage;
