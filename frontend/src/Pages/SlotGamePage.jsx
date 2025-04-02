import React from "react";
import MainLayout from "../Layout/MainLayout";
import ComingSoon from "./ComingSoon";

const SlotGamePage = () => {
  return (
    <MainLayout>
      <ComingSoon
        pageName="Slot"
        launchDate="2025-04-01"
        contactEmail="mmtreasure835@gmail.com"
        contactPhone="+959665912288"
        location="Myanmar"
      />
    </MainLayout>
  );
};

export default SlotGamePage;
