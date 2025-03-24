import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GameCategories = () => {
  const navigate = useNavigate();
  const [activeBrand, setActiveBrand] = useState("All Games");
  const [providersToShow, setProvidersToShow] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const providerImages = {
    "pragmatic-slot": "./providers/pp.jpg",
    "shan-koe-mee": "./providers/shan.jpg",
    "victory-ark": "./providers/va.jpg",
    ibet789: "./providers/ibet.jpg",
    jili: "./providers/jili.jpg",
    live22: "./providers/live22.jpg",
  };

  const allProviders = [
    { name: "Pragmatic Play Slot", key: "pragmatic-slot" },
    { name: "Shan Koe Mee", key: "shan-koe-mee" },
    { name: "Victory Ark", key: "victory-ark" },
    { name: "Ibet 789", key: "ibet789" },
    { name: "Jili", key: "jili" },
    { name: "Live 22", key: "live22" },
  ];

  const brandToProvidersMap = {
    live: ["pragmatic-slot", "shan-koe-mee"],
    slot: ["pragmatic-slot", "victory-ark", "jili", "live22"],
    sportbook: ["ibet789"],
  };

  // Fetch user ID on mount
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
          setUserId(user.uid);
        }
      } catch (error) {
        console.error("Failed to fetch user ID:", error);
      }
    };

    fetchUserId();
  }, []);

  // Fetch games on mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/p2provider/pragmatic/casinogames`
        );
        const gameList = response.data.games || response.data.gameList || [];
        setGames(gameList);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Show all providers by default when component mounts
  useEffect(() => {
    setProvidersToShow(allProviders);
  }, []);

  // Handle provider selection with error handling for Ibet789
  const handleProviderClick = async (provider) => {
    if (provider === "ibet789") {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/ibet/sportbook/loginurl`,
          { userName: userId, language: "en" }
        );

        if (response.data.success) {
          const loginUrl = response.data.loginUrl;
          window.open(loginUrl, "_blank");
          //window.location.href = loginUrl; // Redirect to login URL
        } else {
          throw new Error(response.data.message || "Failed to fetch login URL");
        }
      } catch (error) {
        console.error("Error during Ibet789 login:", error);
        alert("Unable to login to Ibet789. Please try again later.");
      }
    } else if (provider === "pragmatic-slot") {
      navigate("/ppslotgames", { state: { provider } });
    } else if (provider === "shan-koe-mee") {
      navigate("/skm", { state: { provider } });
    } else if (provider === "victory-ark") {
      navigate("/vka", { state: { provider } });
    } else if (provider === "jili") {
      navigate("/jili", { state: { provider } });
    } else if (provider === "live22") {
      navigate("/live22", { state: { provider } });
    }
  };

  // Handle game categories selection
  const handleBrandClick = (brandKey) => {
    setActiveBrand(brandKey);
    if (brandKey === "All Games") {
      setProvidersToShow(allProviders);
    } else {
      const providers = brandToProvidersMap[brandKey]?.map((key) =>
        allProviders.find((provider) => provider.key === key)
      );
      setProvidersToShow(providers);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gray-900 text-white">
        {/* Sidebar */}
        <aside className="w-16 sm:w-20 lg:w-48 bg-black flex-shrink-0 flex flex-col py-4 px-2 lg:px-4 border-r border-gray-700 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="flex flex-col space-y-4">
            {[
              { name: "All Games", icon: "🎮", key: "All Games" },
              { name: "Live", icon: "🎥", key: "live" },
              { name: "Slot", icon: "🎰", key: "slot" },
              { name: "Sportbook", icon: "⚽", key: "sportbook" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => handleBrandClick(item.key)}
                className={`flex items-center justify-center lg:justify-start py-2 px-2 lg:px-4 rounded-md transition ${
                  activeBrand === item.key
                    ? "bg-gray-700 text-yellow-400"
                    : "hover:bg-gray-700"
                }`}
              >
                <span className="text-xl mr-0 lg:mr-4">{item.icon}</span>
                <span className="hidden lg:block font-semibold">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-yellow-400 uppercase">
            {activeBrand === "All Games" ? "All Games" : `${activeBrand}`}
          </h1>
          {loading ? (
            <p className="text-center text-yellow-400">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {providersToShow.map((provider) => (
                <div
                  key={provider.key}
                  onClick={() => handleProviderClick(provider.key)}
                  className="cursor-pointer rounded-lg overflow-hidden bg-gray-800 hover:shadow-lg hover:scale-105 transition-transform"
                >
                  <img
                    src={providerImages[provider.key]}
                    alt={provider.name}
                    className="w-full h-40 object-cover"
                  />
                  <p className="text-center p-2 font-semibold">
                    {provider.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default GameCategories;
