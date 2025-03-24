import React from "react";
import FrontMenu from "../Pages/FrontMenu";
import Footer from "../Pages/Footer";

const MainLayout = ({ children }) => {
  return (
    <>
      <div className="bg-gray-900 text-white min-h-screen font-sans">
        <FrontMenu />
        <div>{children}</div>
        <Footer />
      </div>
    </>
  );
};

export default MainLayout;
