import Home from "./Pages/Home";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Loader from "./Pages/LoveDeathLoader";

// export default App;
const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading with a timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000); // Adjust the duration as needed

    return () => clearTimeout(timer);
  }, []);

  //return <StyledApp>{isLoading ? <Loader /> : <Home />}</StyledApp>;
  return <Home />;
};

const StyledApp = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #212121;
`;

export default App;
