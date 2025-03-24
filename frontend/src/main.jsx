import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GamesPage from "./Pages/GamesPage.jsx";
import AboutPage from "./Pages/AboutPage.jsx";
import LoginPopup from "./Pages/LoginPopup.jsx";
import DashboardPage from "./Pages/DashboardPage.jsx";
import AgentLogin from "./Agent/AgentLogin.jsx";
import PlayerRegister from "./Agent/PlayerRegister.jsx";
import UserGameRecords from "./Pages/UserGameRecord.jsx";
import TransactionHistory from "./Pages/UserTrancRec.jsx";
import UpdateUserPass from "./Pages/UpdateUserPass.jsx";
import PPSlotGamePage from "./Pages/PPSlotGamePage.jsx";
import PragmaticLive from "./Pages/PragmaticLive.jsx";
import SkmPage from "./Pages/SkmPage.jsx";
import VkaPage from "./Pages/VkaPage.jsx";
import IbetPage from "./Pages/IbetPage.jsx";
import JiliPage from "./Pages/JiliPage.jsx";
import Live22Page from "./Pages/Live22Page.jsx";
import SlotGamePage from "./Pages/SlotGamePage.jsx";
import Lottery2D3D from "./Pages/Lottery2D3D.jsx";
import ContactPage from "./Pages/ContactPage.jsx";
// import UserHome from "./Pages/UserHome.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "games",
    element: <GamesPage />,
  },
  {
    path: "ppslotgames",
    element: <PPSlotGamePage />,
  },
  {
    path: "pragmaticlive",
    element: <PragmaticLive />,
  },
  {
    path: "ibet",
    element: <IbetPage />,
  },
  {
    path: "about",
    element: <AboutPage />,
  },
  {
    path: "game_rec",
    element: <UserGameRecords />,
  },
  {
    path: "user_trec",
    element: <TransactionHistory />,
  },
  {
    path: "register",
    element: <PlayerRegister />,
  },
  {
    path: "login",
    element: <LoginPopup />,
  },
  {
    path: "uupdate_pass",
    element: <UpdateUserPass />,
  },
  {
    path: "logout",
  },
  {
    path: "agent",
    element: <DashboardPage />,
  },
  {
    path: "agent-login",
    element: <AgentLogin />,
  },
  {
    path: "slot",
    element: <SlotGamePage />,
  },
  {
    path: "2d3d",
    element: <Lottery2D3D />,
  },
  {
    path: "contact",
    element: <ContactPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
