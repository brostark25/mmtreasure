import React from "react";
import styled from "styled-components";

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="title">BURMA03 IS COMING....</div>
      <div className="loader">
        <div className="container">
          <div className="carousel">
            <div className="heart" />
            <div className="heart" />
            <div className="heart" />
            <div className="heart" />
            <div className="heart" />
            <div className="heart" />
            <div className="heart" />
          </div>
        </div>
        <div className="container">
          <div className="carousel">
            <div className="spade" />
            <div className="spade" />
            <div className="spade" />
            <div className="spade" />
            <div className="spade" />
            <div className="spade" />
            <div className="spade" />
          </div>
        </div>
        <div className="container">
          <div className="carousel">
            <div className="diamond" />
            <div className="diamond" />
            <div className="diamond" />
            <div className="diamond" />
            <div className="diamond" />
            <div className="diamond" />
            <div className="diamond" />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  background-color: #212121;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  .title {
    color: white;
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
  }

  .loader {
    display: flex;
    position: relative;
    justify-items: center;
    align-items: center;
    gap: 1rem;
    height: 55px;
    width: 200px;
    overflow: hidden;
  }

  .container {
    width: 100%;
    display: flex;
    flex-direction: column;
    height: 200px;
    position: relative;
    align-items: center;
  }

  .carousel {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    position: absolute;
    width: 100%;
    transform-origin: center;
    animation-delay: 2s;
  }

  .loader .container:nth-child(3) {
    justify-content: flex-start;
    justify-items: flex-start;
    animation: scroll-up 4s infinite ease-in-out;
    animation-delay: 3s;
  }

  .loader .container:nth-child(2) {
    justify-content: flex-end;
    justify-items: flex-end;
    animation: scroll-down 4s infinite ease-in-out;
    animation-delay: 3s;
  }

  .loader .container:nth-child(1) {
    justify-content: flex-end;
    justify-items: flex-end;
    animation: scroll-down 3s infinite ease-in-out;
    animation-delay: 3s;
  }

  .heart {
    background: black;
    display: flex;
    width: 30px;
    height: 30px;
    position: relative;
    align-items: center;
    justify-content: center;
    left: 8px;
    margin: 0.8rem 4px;
    transform: rotate(45deg);
    animation-delay: 2s;
  }

  .heart::before,
  .heart::after {
    content: "";
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: darkred;
  }

  .heart::before {
    left: -16px;
  }

  .heart::after {
    top: -16px;
  }

  .spade {
    display: flex;
    width: 30px;
    height: 30px;
    background: black;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    margin: 0.8rem 4px;
    animation-delay: 2s;
  }

  .diamond {
    display: flex;
    width: 30px;
    height: 30px;
    background: darkred;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    margin: 0.8rem 4px;
    animation-delay: 2s;
  }

  .loader:hover {
    animation: none;
  }

  @keyframes scroll-up {
    0% {
      transform: translateY(0);
      filter: blur(0);
    }

    30% {
      transform: translateY(-150%);
      filter: blur(10px);
    }

    60% {
      transform: translateY(0);
      filter: blur(0px);
    }
  }

  @keyframes scroll-down {
    0% {
      transform: translateY(0);
      filter: blur(0);
    }

    30% {
      transform: translateY(150%);
      filter: blur(10px);
    }

    60% {
      transform: translateY(0);
      filter: blur(0px);
    }
  }

  @keyframes rotation {
    20%,
    100% {
      transform: rotate(180deg);
    }
  }

  @keyframes blink {
    0% {
      height: 0;
    }

    20% {
      height: 12px;
    }

    100% {
      height: 12px;
    }
  }
`;

export default Loader;
