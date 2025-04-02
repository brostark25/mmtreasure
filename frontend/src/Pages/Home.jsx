import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import i18n from "../i18n";
import { I18nextProvider } from "react-i18next";
import MainLayout from "../Layout/MainLayout";
import BannerSlider from "./BannerSlider";
import News from "./News";
import WinnerAnnouncement from "./WinnerAnnouncement";
import GameCategories from "./GameCategories";
import { jwtDecode } from "jwt-decode";
import ServicesPage from "./ServicesPage";
import PortfolioSection from "./PortfolioSection";
import PartnersSection from "./PartnersSection";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    uid: "",
    currency: "",
    balance: "",
  });
  const [showPopup, setShowPopup] = useState(true); // State for popup visibility

  // Close popup
  const closePopup = () => setShowPopup(false);

  // Fetch user data if logged in
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        console.log(decodedToken); // Check the decoded token to verify the expiry, userId, etc.
      }
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/uhome`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is sent as 'Bearer <token>'
          },
        }
      );

      setUserData(response.data.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Failed to fetch user ID:", error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    fetchUser();
    const checkTokenAndFetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await fetchUser(); // Call fetchUser if token exists
      } else {
        console.warn("No token found in localStorage");
        setIsLoggedIn(false);
      }
    };

    checkTokenAndFetchUser();
  }, []);

  // Animation helpers
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const [animatedBalance, setAnimatedBalance] = useState(0);

  useEffect(() => {
    const targetBalance = userData.balance;
    let currentBalance = 0;
    const increment = Math.ceil(targetBalance / 100);

    const animateBalance = () => {
      const interval = setInterval(() => {
        currentBalance += increment;
        if (currentBalance >= targetBalance) {
          currentBalance = targetBalance;
          clearInterval(interval);
        }
        setAnimatedBalance(currentBalance);
      }, 30);
    };

    animateBalance();
  }, [userData.balance]);

  const MotionSection = ({ children, variants, delay = 0 }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={variants}
        transition={{ delay }}
      >
        {children}
      </motion.div>
    );
  };

  // Currency image helper
  /* const getCurrencyImage = (currency) => {
    switch (currency) {
      case "MMK":
        return "currency/mmk.png";
      case "THB":
        return "currency/thb.png";
      case "USDT":
        return "currency/usdt.png";
      default:
        return "currency/mmk.png";
    }
  };*/

  return (
    <I18nextProvider i18n={i18n}>
      <MainLayout>
        {isLoggedIn ? (
          <>
            {/* UID and Currency Display */}
            <section className="bg-black text-white p-4 flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-bold font-poppins mr-2">User ID:</span>{" "}
                {userData.uid}
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="font-bold font-poppins mr-2">Balance:</span>
                <span className="font-mono text-lg">
                  {Number(animatedBalance).toLocaleString()}{" "}
                  {/* Format balance with commas */}
                </span>
                <span className="font-bold font-poppins">
                  {userData.currency}
                </span>
              </div>
            </section>

            {/* Banner */}
            <section className="flex justify-center items-center">
              <BannerSlider />
            </section>

            <ServicesPage />

            {/* Games By Category */}
            {/* <GameCategories /> */}

            <PortfolioSection />

            {/* News */}
            {/* <News /> */}
          </>
        ) : (
          <>
            <MotionSection variants={fadeInUp}>
              <section className="flex justify-center items-center">
                <BannerSlider />
              </section>
            </MotionSection>

            <MotionSection variants={fadeInUp} delay={0.4}>
              <PortfolioSection />
            </MotionSection>

            <MotionSection variants={fadeInUp} delay={0.6}>
              <ServicesPage />
            </MotionSection>

            {/* <MotionSection variants={fadeInUp} delay={0.4}>
              <GameCategories />
            </MotionSection> */}

            {/* <MotionSection variants={fadeInUp} delay={0.6}></MotionSection> */}

            <MotionSection variants={fadeInUp} delay={0.8}>
              <PartnersSection />
            </MotionSection>
          </>
        )}
      </MainLayout>
    </I18nextProvider>
  );
};

export default Home;
