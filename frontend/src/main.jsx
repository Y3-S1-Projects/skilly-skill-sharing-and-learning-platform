import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { HeroUIProvider } from "@heroui/react";
import NotificationProvider from "./Components/CustomNotification/NotificationProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HeroUIProvider>
      <NotificationProvider position="top-right">
        <App />
      </NotificationProvider>
    </HeroUIProvider>
  </StrictMode>
);
