import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../Layout/MainLayout";

const PPSlotGamePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [games, setGames] = useState([]);
  const [hotGames, setHotGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);

  // Base URL for game images
  const gameImageBaseUrl = "https://common-static.ppgames.net/game_pic";

  // Fetch user data to retrieve ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/uhome`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 201) {
          const { user } = response.data;
          setUserId(user.uid); // Set the user ID from the database
        }
      } catch (error) {
        console.error("Failed to fetch user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  // Fetch games data
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
        setGames(hotGamesResponse.data.games?.all || []);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleLaunchGame = async (gameID) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !gameID) {
        alert("You must be logged in to play a game.");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/p2provider/pragmatic/launchgame`,
        {
          symbol: gameID, // Assuming gameID is used as the "symbol"
          externalPlayerId: userId, // Replace with actual player ID
          language: "en", // Adjust based on user preference or API requirement
          token, // Authentication token
          gameId: gameID, // Ensure gameId is passed
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 && response.data.gameURL) {
        window.open(response.data.gameURL, "_blank");
      } else {
        alert("Failed to launch game. Please try again.");
      }
    } catch (error) {
      console.error(
        "Error launching game:",
        error.message,
        error.response?.data
      );
      alert("Error launching game. Please try again.");
    }
  };

  // Filter games by search query or category
  const filteredGames = games.filter(
    (game) =>
      (selectedCategory === "All" ||
        game.category?.toLowerCase() === selectedCategory.toLowerCase()) &&
      game.gameName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Determine search bar color based on results
  const searchBarColor =
    searchQuery && filteredGames.length === 0
      ? "border-red-500"
      : "border-gray-300";

  return (
    <MainLayout>
      <div className="p-6 font-sans min-h-screen bg-gray-900 text-white">
        <h1 className="text-4xl font-extrabold text-center mb-8">
          Pragmatic Play Slot Games
        </h1>

        {/* Search and Category Filter */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          {/*<select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-4 border-2 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All</option>
            <option value="Slot">Slot</option>
            <option value="Casino">Casino</option>
            <option value="Live Casino">Live Casino</option>
            <option value="Victory Ark">Victory Ark</option>
          </select>*/}
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`py-2 px-4 border-2 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${searchBarColor}`}
          />
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <p className="text-center text-indigo-500 text-xl">
            Loading games...
          </p>
        ) : (
          <>
            {/* Hot Games Section */}
            <section className="mb-8">
              {/* <h2 className="text-2xl font-semibold text-center mb-4">
                Popular Games of the Week
              </h2> */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {hotGames.map((game) => (
                  <div
                    key={game.gameID}
                    className="bg-gray-800 p-4 sm:p-2 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105 cursor-pointer"
                    onClick={() => handleLaunchGame(game.gameID)}
                  >
                    <img
                      src={`${gameImageBaseUrl}/rec/325/${game.gameID}.png`}
                      alt={game.gameName || "Game Thumbnail"}
                      className="w-full h-40 sm:h-60 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                    <p className="text-center text-sm sm:text-lg font-semibold mt-2">
                      {game.gameName || "Unnamed Game"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* All Games Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <div
                  key={game.gameID}
                  className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105 cursor-pointer"
                  onClick={() => handleLaunchGame(game.gameID)}
                >
                  <img
                    src={`${gameImageBaseUrl}/rec/325/${game.gameID}.png`}
                    alt={game.gameName || "Game Thumbnail"}
                    className="w-full h-60 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                  <p className="text-center text-lg font-semibold">
                    {game.gameName || "Unnamed Game"}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default PPSlotGamePage;
